import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = refreshSchema;

const accessTokenExpiresIn = "7d";
const refreshTokenExpiresIn = "30d";
const refreshTokenLifetimeMs = 30 * 24 * 60 * 60 * 1000;

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

const getRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return process.env.JWT_REFRESH_SECRET;
};

const createAccessToken = (userId: string) => {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: accessTokenExpiresIn });
};

const createRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, getRefreshSecret(), { expiresIn: refreshTokenExpiresIn });
};

const saveRefreshToken = async (userId: string, refreshToken: string) => {
  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
    },
  });
};

const tokenResponse = (accessToken: string, refreshToken: string) => ({
  accessToken,
  refreshToken,
});

export const register = async (request: Request, response: Response) => {
  const parsedBody = registerSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const { name, email, password } = parsedBody.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    response.status(409).json({ error: "Email is already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: { id: true },
  });

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  await saveRefreshToken(user.id, refreshToken);

  response.status(201).json({ data: tokenResponse(accessToken, refreshToken) });
};

export const login = async (request: Request, response: Response) => {
  const parsedBody = loginSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const { email, password } = parsedBody.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  await saveRefreshToken(user.id, refreshToken);

  response.json({ data: tokenResponse(accessToken, refreshToken) });
};

export const refresh = async (request: Request, response: Response) => {
  const parsedBody = refreshSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const { refreshToken } = parsedBody.data;

  try {
    jwt.verify(refreshToken, getRefreshSecret());
  } catch {
    response.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    select: {
      userId: true,
      expiresAt: true,
    },
  });

  if (!storedToken || storedToken.expiresAt <= new Date()) {
    response.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  const accessToken = createAccessToken(storedToken.userId);
  response.json({ data: { accessToken } });
};

export const logout = async (request: Request, response: Response) => {
  const parsedBody = logoutSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  await prisma.refreshToken.deleteMany({
    where: { token: parsedBody.data.refreshToken },
  });

  response.json({ data: { success: true } });
};

export const me = async (request: Request, response: Response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Authentication is required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: request.userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  response.json({ data: user });
};
