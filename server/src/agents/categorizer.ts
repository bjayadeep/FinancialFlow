import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const categories = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Utilities",
  "Shopping",
  "Income",
  "Other",
] as const;

const categorySchema = z.enum(categories);

const categorizationSchema = z.array(
  z.object({
    index: z.number().int().nonnegative(),
    category: categorySchema,
  }),
);

export interface CategorizerTransaction {
  description: string;
  amount: number;
  type: "income" | "expense";
}

export interface CategorizedTransaction extends CategorizerTransaction {
  category: (typeof categories)[number];
  aiTagged: true;
}

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

export const categorizeTransactions = async (
  transactions: CategorizerTransaction[],
): Promise<CategorizedTransaction[]> => {
  if (transactions.length === 0) {
    return [];
  }

  ensureGroqApiKey();

  const systemPrompt = `Categorize each transaction for FinanceFlow.

Use only these categories: ${categories.join(", ")}.

Return only valid JSON. Do not include markdown, commentary, or extra keys.
The JSON must be an array of objects shaped exactly like:
[{"index":0,"category":"Food"}]

Return exactly one object for every transaction index.`;
  const userMessage = `Transactions:

${JSON.stringify(
  transactions.map((transaction, index) => ({
    index,
    description: transaction.description,
    amount: transaction.amount,
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

  const responseText = completion.choices[0]?.message.content ?? "";
  const parsedInput = categorizationSchema.parse(
    JSON.parse(extractJson(responseText)) as unknown,
  );
  const categoriesByIndex = new Map(
    parsedInput.map((item) => [item.index, item.category]),
  );

  return transactions.map((transaction, index) => ({
    ...transaction,
    category: categoriesByIndex.get(index) ?? "Other",
    aiTagged: true,
  }));
};
