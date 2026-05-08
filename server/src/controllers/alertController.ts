import type { Request, Response } from "express";
import type { Alert, Prisma } from "@prisma/client";
import { z } from "zod";
import { anomalyDetector } from "../agents/anomalyDetector";
import { prisma } from "../lib/prisma";

const alertStatusSchema = z.enum(["unreviewed", "safe", "dismissed"]);

const alertsQuerySchema = z.object({
  status: alertStatusSchema.optional(),
});

const alertParamsSchema = z.object({
  id: z.string().min(1, "Alert id is required"),
});

const updateAlertSchema = z.object({
  status: alertStatusSchema,
});

const getUserId = (request: Request, response: Response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Authentication is required" });
    return undefined;
  }

  return request.userId;
};

const getAlertId = (request: Request, response: Response) => {
  const parsedParams = alertParamsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    response.status(400).json({ error: parsedParams.error.issues[0]?.message ?? "Invalid request" });
    return undefined;
  }

  return parsedParams.data.id;
};

const shapeAlert = (alert: Alert) => ({
  id: alert.id,
  title: alert.title,
  explanation: alert.explanation,
  severity: alert.severity,
  status: alert.status,
  merchant: alert.merchant,
  amount: alert.amount,
  date: alert.date ? alert.date.toISOString().split("T")[0] : null,
  confidence: alert.confidence === null ? null : Math.round(alert.confidence * 100),
  createdAt: alert.createdAt.toISOString(),
});

export const getAlerts = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const parsedQuery = alertsQuerySchema.safeParse(request.query);

  if (!parsedQuery.success) {
    response.status(400).json({ error: parsedQuery.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const where: Prisma.AlertWhereInput = {
    userId,
    ...(parsedQuery.data.status ? { status: parsedQuery.data.status } : {}),
  };
  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  response.json({ data: alerts.map(shapeAlert) });
};

export const scanAlerts = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  try {
    const alerts = await anomalyDetector(userId);

    response.status(201).json({ data: alerts.map(shapeAlert) });
  } catch (caughtError) {
    response.status(500).json({
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to scan transactions for anomalies",
    });
  }
};

export const updateAlert = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const alertId = getAlertId(request, response);

  if (!alertId) {
    return;
  }

  const parsedBody = updateAlertSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const existingAlert = await prisma.alert.findFirst({
    where: {
      id: alertId,
      userId,
    },
    select: { id: true },
  });

  if (!existingAlert) {
    response.status(404).json({ error: "Alert not found" });
    return;
  }

  const alert = await prisma.alert.update({
    where: { id: existingAlert.id },
    data: { status: parsedBody.data.status },
  });

  response.json({ data: shapeAlert(alert) });
};
