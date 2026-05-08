import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../controllers/transactionController";
import { authMiddleware } from "../middleware/auth";

export const transactionsRouter = Router();

transactionsRouter.use(authMiddleware);

transactionsRouter.get("/", getTransactions);
transactionsRouter.post("/", createTransaction);
transactionsRouter.put("/:id", updateTransaction);
transactionsRouter.delete("/:id", deleteTransaction);
