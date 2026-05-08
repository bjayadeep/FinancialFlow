import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const getUserId = (request: Request, response: Response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Authentication is required" });
    return undefined;
  }

  return request.userId;
};

const getMonthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const getMonthLabel = (date: Date) =>
  date.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });

const getFullMonthLabel = (date: Date) =>
  date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const getMonthRange = (date: Date) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));

  return { start, end };
};

const getTrendMonths = () => {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const offset = 5 - index;
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth() - offset, 1));

    return {
      key: getMonthKey(date),
      month: getMonthLabel(date),
      income: 0,
      expenses: 0,
    };
  });
};

export const getDashboard = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const [transactions, budgets] = await prisma.$transaction([
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        description: true,
        category: true,
        account: true,
        amount: true,
        currency: true,
        type: true,
      },
    }),
    prisma.budget.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }, { category: "asc" }],
      select: {
        id: true,
        category: true,
        limit: true,
        month: true,
        year: true,
      },
    }),
  ]);

  const mostRecentTransactionDate = transactions[0]?.date;
  const mostRecentMonth = mostRecentTransactionDate
    ? getFullMonthLabel(mostRecentTransactionDate)
    : "No transactions";
  const monthlyRange = mostRecentTransactionDate
    ? getMonthRange(mostRecentTransactionDate)
    : undefined;

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyTransactions = monthlyRange
    ? transactions.filter(
        (transaction) =>
          transaction.date >= monthlyRange.start && transaction.date < monthlyRange.end,
      )
    : [];
  const monthlyIncome = monthlyTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyExpenses = monthlyTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const savingsRate =
    monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const spendingByCategory = Object.entries(
    transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce<Record<string, number>>((totals, transaction) => {
        totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
        return totals;
      }, {}),
  )
    .map(([category, amount]) => ({ category, amount }))
    .sort((first, second) => second.amount - first.amount);
  const trendByMonth = new Map(getTrendMonths().map((month) => [month.key, month]));

  transactions.forEach((transaction) => {
    const trendMonth = trendByMonth.get(getMonthKey(transaction.date));

    if (!trendMonth) {
      return;
    }

    if (transaction.type === "income") {
      trendMonth.income += transaction.amount;
    } else if (transaction.type === "expense") {
      trendMonth.expenses += transaction.amount;
    }
  });

  const spendingByCategoryMap = new Map(
    spendingByCategory.map((item) => [item.category, item.amount]),
  );

  response.json({
    data: {
      totalBalance: totalIncome - totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      mostRecentMonth,
      savingsRate,
      spendingByCategory,
      monthlyTrend: Array.from(trendByMonth.values()).map(({ month, income, expenses }) => ({
        month,
        income,
        expenses,
      })),
      recentTransactions: transactions.slice(0, 5).map((transaction) => ({
        id: transaction.id,
        date: transaction.date.toISOString(),
        description: transaction.description,
        category: transaction.category,
        account: transaction.account,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
      })),
      budgetProgress: budgets.map((budget) => ({
        id: budget.id,
        category: budget.category,
        spent: spendingByCategoryMap.get(budget.category) ?? 0,
        limit: budget.limit,
        month: budget.month,
        year: budget.year,
      })),
    },
  });
};
