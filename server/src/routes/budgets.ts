import { Router } from "express";
import {
  createBudget,
  deleteBudget,
  getBudgetSuggestions,
  getBudgets,
  updateBudget,
} from "../controllers/budgetController";
import { authMiddleware } from "../middleware/auth";

export const budgetsRouter = Router();

budgetsRouter.use(authMiddleware);

budgetsRouter.get("/", getBudgets);
budgetsRouter.post("/suggestions", getBudgetSuggestions);
budgetsRouter.post("/", createBudget);
budgetsRouter.put("/:id", updateBudget);
budgetsRouter.delete("/:id", deleteBudget);
