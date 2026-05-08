import Groq from "groq-sdk";
import { prisma } from "../lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ChatAssistantInput {
  message: string;
  userId: string;
}

const ensureGroqApiKey = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const buildFinancialContext = async (userId: string) => {
  const [transactions, budgets] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
      },
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

  const expenseTotal = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const incomeTotal = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const spendingByCategory = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
      return totals;
    }, {});

  const categoryLines = Object.entries(spendingByCategory)
    .sort(([, firstAmount], [, secondAmount]) => secondAmount - firstAmount)
    .map(([category, amount]) => `- ${category}: ${formatCurrency(amount)}`)
    .join("\n");

  const transactionLines = transactions
    .map(
      (transaction) =>
        `- ${transaction.date.toISOString().split("T")[0]} | ${transaction.type} | ${transaction.category} | ${formatCurrency(
          transaction.amount,
        )} ${transaction.currency} | ${transaction.description} | ${transaction.account}`,
    )
    .join("\n");

  const budgetLines = budgets
    .map(
      (budget) =>
        `- ${budget.category}: ${formatCurrency(budget.limit)} for ${budget.month}/${budget.year}`,
    )
    .join("\n");

  return `Financial data scope: all transactions plus all budgets.

Summary:
- Transaction count: ${transactions.length}
- Total income: ${formatCurrency(incomeTotal)}
- Total expenses: ${formatCurrency(expenseTotal)}
- Net cash flow: ${formatCurrency(incomeTotal - expenseTotal)}

Spending by category:
${categoryLines || "- No expense transactions found."}

Transactions:
${transactionLines || "- No transactions found."}

Budgets:
${budgetLines || "- No budgets found."}`;
};

export const chatAssistant = async ({ message, userId }: ChatAssistantInput) => {
  const financialContext = await buildFinancialContext(userId);
  ensureGroqApiKey();

  const systemPrompt =
    "You are a personal finance assistant. Answer questions based only on the user's actual financial data provided. Be concise and helpful. Format numbers as currency.";
  const userMessage = `Financial data context:
${financialContext}

User question:
${message}`;
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.2,
  });

  return (completion.choices[0]?.message.content ?? "").trim();
};
