import { Router } from "express";
import { sendChatMessage } from "../controllers/chatController";
import { authMiddleware } from "../middleware/auth";

export const chatRouter = Router();

chatRouter.post("/", authMiddleware, sendChatMessage);
