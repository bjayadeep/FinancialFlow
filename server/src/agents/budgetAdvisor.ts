import Groq from "groq-sdk";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const suggestionTypeSchema = z.enum(["increase", "decrease", "new"]);

const budgetSuggestionSchema = z.object({
  suggestion: z.string().trim().min(1),
  category: z.string().trim().min(1),
  type: suggestionTypeSchema,
  suggestedLimit: z.coerce.number().positive(),
});

const budgetSuggestionsSchema = z.array(budgetSuggestionSchema).length(3);

export type BudgetSuggestion = z.infer<typeof budgetSuggestionSchema>;

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

export const budgetAdvisor = async (userId: string): Promise<BudgetSuggestion[]> => {
  const [transactions, budgets] = await prisma.$transaction([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: {
        amount: true,
        description: true,
        date: true,
        category: true,
        account: true,
        type: true,
        currency: true,
      },
    }),
    prisma.budget.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }, { category: "asc" }],
      select: {
        category: true,
        limit: true,
        month: true,
        year: true,
      },
    }),
  ]);

  ensureGroqApiKey();

  const systemPrompt =
    "You are a personal finance advisor. Analyze the user's spending and budget data and provide 3 specific, actionable budget suggestions. Return only valid JSON array with fields: suggestion (string), category (string), type (increase/decrease/new), suggestedLimit (number). For increase/decrease, suggestedLimit must be the new monthly budget limit. For new, suggestedLimit must be the monthly limit to create. Do not include markdown, commentary, or extra keys.";
  const userMessage = `Transactions:
${JSON.stringify(
  transactions.map((transaction) => ({
    amount: transaction.amount,
    currency: transaction.currency,
    description: transaction.description,
    date: transaction.date.toISOString().split("T")[0],
    category: transaction.category,
    account: transaction.account,
    type: transaction.type,
  })),
)}

Budgets:
${JSON.stringify(budgets)}`;
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.2,
  });

  return budgetSuggestionsSchema.parse(
    JSON.parse(extractJson(completion.choices[0]?.message.content ?? "")) as unknown,
  );
};
