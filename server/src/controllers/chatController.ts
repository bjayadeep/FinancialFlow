import type { Request, Response } from "express";
import { z } from "zod";
import { chatAssistant } from "../agents/chatAssistant";

const chatSchema = z.object({
  message: z.string().trim().min(1, "Message is required"),
});

const getUserId = (request: Request, response: Response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Authentication is required" });
    return undefined;
  }

  return request.userId;
};

export const sendChatMessage = async (request: Request, response: Response) => {
  const userId = getUserId(request, response);

  if (!userId) {
    return;
  }

  const parsedBody = chatSchema.safeParse(request.body);

  if (!parsedBody.success) {
    response.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  try {
    const aiResponse = await chatAssistant({
      message: parsedBody.data.message,
      userId,
    });

    response.json({ response: aiResponse });
  } catch (caughtError) {
    response.status(500).json({
      error:
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate chat response",
    });
  }
};
