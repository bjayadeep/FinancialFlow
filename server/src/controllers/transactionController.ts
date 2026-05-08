import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const transactionTypeSchema = z.enum(["income", "expense"]);

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().trim().min(1, "Description is required"),
  date: z.coerce.date(),
  category: z.string().trim().min(1, "Category is required"),
  account: z.string().trim().min(1, "Account is required"),
  type: transactionTypeSchema,
});

const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  all: z
    .preprocess((value) => value === "true" || value === true, z.boolean())
    .optional()
    .default(false),
  category: z.string().trim().min(1).optional(),
  type: transactionTypeSchema.optional(),
  search: z.string().trim().min(1).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

const transactionParamsSchema = z.object({
  id: z.string().min(1, "Transaction id is required"),
});

const getUserId = (request: Request, response: Response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Authentication is required" });
    return undefined;
  }

  return request.userId;
};

const getTransactionId = (request: Request, response: Response) => {
  const parsedParams = transactionParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    response.status(400).json({ error: parsedParams.error.issues[0]?.message ?? "Invalid request" });
    return undefined;
  }

  return parsedParams.data.id;
};

export const getTransactions = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const parsedQuery = transactionsQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    response.status(400).json({ error: parsedQuery.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const { page, limit, all, category, type, search, dateFrom, dateTo } = parsedQuery.data;
  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(category ? { category } : {}),
    ...(type ? { type } : {}),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { account: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    }),
    prisma.transaction.count({ where }),
  ]);

  response.json({
    data: transactions,
    total,
    page,
    totalPages: all ? 1 : Math.ceil(total / limit),
  });
};

export const createTransaction = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const parsedBody = transactionSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const transaction = await prisma.transaction.create({
    data: {
      ...parsedBody.data,
      userId,
    },
  });

  response.status(201).json({ data: transaction });
};

export const updateTransaction = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const transactionId = getTransactionId(request, response);

  if (!transactionId) {
    return;
  }

  const parsedBody = transactionSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    select: { id: true },
  });

  if (!existingTransaction) {
    response.status(404).json({ error: "Transaction not found" });
    return;
  }

  const transaction = await prisma.transaction.update({
    where: { id: existingTransaction.id },
    data: parsedBody.data,
  });

  response.json({ data: transaction });
};

export const deleteTransaction = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const transactionId = getTransactionId(request, response);

  if (!transactionId) {
    return;
  }

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    select: { id: true },
  });

  if (!existingTransaction) {
    response.status(404).json({ error: "Transaction not found" });
    return;
  }

  await prisma.transaction.delete({
    where: { id: existingTransaction.id },
  });

  response.json({ success: true });
};
