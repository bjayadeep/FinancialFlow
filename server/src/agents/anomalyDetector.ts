import Groq from "groq-sdk";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const severitySchema = z.enum(["high", "medium", "low"]);

const anomalySchema = z.object({
  title: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
  severity: severitySchema,
  merchant: z.string().trim().min(1),
  amount: z.coerce.number().nonnegative(),
  date: z.coerce.date(),
  confidence: z.coerce.number().min(0).max(1),
});

const anomaliesSchema = z.array(anomalySchema);

const ensureGroqApiKey = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
};

const extractJson = (text: string) => {
  const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedJson?.[1]) {
    return fencedJson[1];
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.slice(firstBracket, lastBracket + 1);
  }

  return text;
};

const getCategoryAverages = (
  transactions: {
    category: string;
    amount: number;
  }[],
) => {
  const totals = new Map<string, { total: number; count: number }>();

  transactions.forEach((transaction) => {
    const current = totals.get(transaction.category) ?? { total: 0, count: 0 };

    totals.set(transaction.category, {
      total: current.total + transaction.amount,
      count: current.count + 1,
    });
  });

  return Array.from(totals.entries()).map(([category, value]) => ({
    category,
    averageAmount: value.total / value.count,
    transactionCount: value.count,
  }));
};

export const anomalyDetector = async (userId: string) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      amount: true,
      description: true,
      date: true,
      category: true,
      account: true,
      type: true,
    },
  });

  if (transactions.length === 0) {
    return [];
  }

  ensureGroqApiKey();

  const categoryAverages = getCategoryAverages(transactions);
  const systemPrompt =
    "Analyze transactions and identify anomalies. Flag transactions that are unusually large compared to the average for that category, from unfamiliar merchants, or outside normal spending patterns. Return only valid JSON array of anomalies with fields: title, explanation, severity (high/medium/low), merchant, amount, date, confidence (0-1). Do not include markdown, commentary, or extra keys.";
  const userMessage = `Category averages:

${JSON.stringify(categoryAverages)}

All transactions:
${JSON.stringify(
  transactions.map((transaction) => ({
    id: transaction.id,
    merchant: transaction.description,
    amount: transaction.amount,
    date: transaction.date.toISOString().split("T")[0],
    category: transaction.category,
    account: transaction.account,
    type: transaction.type,
  })),
)}`;
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0,
  });

  const parsedAnomalies = anomaliesSchema.parse(
    JSON.parse(extractJson(completion.choices[0]?.message.content ?? "")) as unknown,
  );
  const createdAlerts = [];

  for (const anomaly of parsedAnomalies) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        userId,
        merchant: anomaly.merchant,
        amount: anomaly.amount,
        date: anomaly.date,
      },
      select: { id: true },
    });

    if (existingAlert) {
      continue;
    }

    const alert = await prisma.alert.create({
      data: {
        userId,
        title: anomaly.title,
        explanation: anomaly.explanation,
        severity: anomaly.severity,
        merchant: anomaly.merchant,
        amount: anomaly.amount,
        date: anomaly.date,
        confidence: anomaly.confidence,
      },
    });

    createdAlerts.push(alert);
  }

  return createdAlerts;
};
