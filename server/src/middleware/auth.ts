import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface AccessTokenPayload {
  userId: string;
}

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

const isAccessTokenPayload = (payload: unknown): payload is AccessTokenPayload => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "userId" in payload &&
    typeof (payload as { userId: unknown }).userId === "string"
  );
};

export const authMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const authHeader = request.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    response.status(401).json({ error: "Access token is required" });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (!isAccessTokenPayload(payload)) {
      response.status(401).json({ error: "Invalid access token" });
      return;
    }

    request.userId = payload.userId;
    next();
  } catch {
    response.status(401).json({ error: "Invalid access token" });
  }
};
