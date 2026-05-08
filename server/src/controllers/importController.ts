import type { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { categorizeTransactions } from "../agents/categorizer";
import { prisma } from "../lib/prisma";

const csvRecordSchema = z.record(z.string(), z.unknown());

interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  account: string;
  type: "income" | "expense";
}

const currencySchema = z.enum(["INR", "USD"]).default("INR");

const getUserId = (request: Request, response: Response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Authentication is required" });
    return undefined;
  }

  return request.userId;
};

const normalizeHeader = (header: string) => {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
};

const findColumn = (headers: string[], candidates: string[]) => {
  return headers.find((header) => {
    const normalizedHeader = normalizeHeader(header);

    return candidates.some((candidate) => {
      const normalizedCandidate = normalizeHeader(candidate);

      return (
        normalizedHeader.includes(normalizedCandidate) ||
        normalizedCandidate.includes(normalizedHeader)
      );
    });
  });
};

const getStringCell = (row: Record<string, unknown>, column: string) => {
  const value = row[column];

  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const parseAmount = (value: string) => {
  const isParenthesizedNegative = /^\(.*\)$/.test(value.trim());
  const numericValue = Number(value.replace(/[$₹,\s()]/g, ""));

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return isParenthesizedNegative ? -Math.abs(numericValue) : numericValue;
};

const parseDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
};

const mapCsvRows = (rows: Record<string, unknown>[]) => {
  const headers = Object.keys(rows[0] ?? {});
  const dateColumn = findColumn(headers, ["date", "posted date", "transaction date"]);
  const amountColumn = findColumn(headers, ["amount", "debit", "credit", "value"]);
  const descriptionColumn = findColumn(headers, [
    "description",
    "merchant",
    "memo",
    "name",
    "details",
  ]);
  const accountColumn = findColumn(headers, ["account", "account name", "bank"]);

  if (!dateColumn || !amountColumn || !descriptionColumn) {
    throw new Error("CSV must include date, amount, and description columns");
  }

  return rows.map((row, index): ParsedTransaction => {
    const rawDate = getStringCell(row, dateColumn);
    const rawAmount = getStringCell(row, amountColumn);
    const description = getStringCell(row, descriptionColumn);
    const amount = parseAmount(rawAmount);
    const date = parseDate(rawDate);

    if (!date || amount === undefined || !description) {
      throw new Error(`CSV row ${index + 1} has invalid transaction data`);
    }

    return {
      date,
      description,
      amount: Math.abs(amount),
      account: accountColumn ? getStringCell(row, accountColumn) || "Imported" : "Imported",
      type: amount < 0 ? "expense" : "income",
    };
  });
};

export const importCsv = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  if (!request.file) {
    response.status(400).json({ error: "CSV file is required" });
    return;
  }

  try {
    const currency = currencySchema.parse(request.body.currency);
    const rows = z.array(csvRecordSchema).parse(
      parse(request.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      }),
    );

    if (rows.length === 0) {
      response.status(400).json({ error: "CSV file has no transaction rows" });
      return;
    }

    const parsedTransactions = mapCsvRows(rows);
    const categorizedTransactions = await categorizeTransactions(
      parsedTransactions.map(({ description, amount, type }) => ({
        description,
        amount,
        type,
      })),
    );

    const transactionsToCreate = parsedTransactions.map((transaction, index) => ({
      userId,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      currency,
      account: transaction.account,
      type: transaction.type,
      category: categorizedTransactions[index]?.category ?? "Other",
      aiTagged: true,
    }));

    const transactions = await prisma.transaction.createManyAndReturn({
      data: transactionsToCreate,
    });

    response.status(201).json({
      imported: transactions.length,
      transactions,
    });
  } catch (caughtError) {
    response.status(400).json({
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to import CSV",
    });
  }
};
