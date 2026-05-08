import type { Request, Response } from "express";
import { z } from "zod";
import { budgetAdvisor } from "../agents/budgetAdvisor";
import { prisma } from "../lib/prisma";

const budgetSchema = z.object({
  category: z.string().trim().min(1, "Category is required"),
  limit: z.coerce.number().positive("Limit must be greater than 0"),
  month: z.coerce.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  year: z.coerce.number().int().min(2000, "Year must be 2000 or later").max(2100, "Year must be 2100 or earlier"),
});

const budgetParamsSchema = z.object({
  id: z.string().min(1, "Budget id is required"),
});

const getUserId = (request: Request, response: Response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Authentication is required" });
    return undefined;
  }

  return request.userId;
};

const getBudgetId = (request: Request, response: Response) => {
  const parsedParams = budgetParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    response.status(400).json({ error: parsedParams.error.issues[0]?.message ?? "Invalid request" });
    return undefined;
  }

  return parsedParams.data.id;
};

const shapeBudget = (budget: {
  id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
}, spent: number) => ({
  id: budget.id,
  category: budget.category,
  limit: budget.limit,
  month: budget.month,
  year: budget.year,
  spent,
});

const getBudgetSpend = async (userId: string, category: string) => {
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      category,
      type: "expense",
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount ?? 0;
};

export const getBudgets = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }, { category: "asc" }],
    select: {
      id: true,
      category: true,
      limit: true,
      month: true,
      year: true,
    },
  });

  const data = await Promise.all(
    budgets.map(async (budget) =>
      shapeBudget(
        budget,
        await getBudgetSpend(userId, budget.category),
      ),
    ),
  );

  response.json({ data });
};

export const getBudgetSuggestions = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  try {
    const suggestions = await budgetAdvisor(userId);

    response.json({ suggestions });
  } catch (caughtError) {
    response.status(500).json({
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate budget suggestions",
    });
  }
};

export const createBudget = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const parsedBody = budgetSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const budget = await prisma.budget.create({
    data: {
      ...parsedBody.data,
      userId,
    },
    select: {
      id: true,
      category: true,
      limit: true,
      month: true,
      year: true,
    },
  });

  response.status(201).json({
    data: shapeBudget(
      budget,
      await getBudgetSpend(userId, budget.category),
    ),
  });
};

export const updateBudget = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const budgetId = getBudgetId(request, response);

  if (!budgetId) {
    return;
  }

  const parsedBody = budgetSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const existingBudget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    select: { id: true },
  });

  if (!existingBudget) {
    response.status(404).json({ error: "Budget not found" });
    return;
  }

  const budget = await prisma.budget.update({
    where: { id: existingBudget.id },
    data: parsedBody.data,
    select: {
      id: true,
      category: true,
      limit: true,
      month: true,
      year: true,
    },
  });

  response.json({
    data: shapeBudget(
      budget,
      await getBudgetSpend(userId, budget.category),
    ),
  });
};

export const deleteBudget = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const budgetId = getBudgetId(request, response);

  if (!budgetId) {
    return;
  }

  const existingBudget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
    select: { id: true },
  });

  if (!existingBudget) {
    response.status(404).json({ error: "Budget not found" });
    return;
  }

  await prisma.budget.delete({
    where: { id: existingBudget.id },
  });

  response.json({ success: true });
};
