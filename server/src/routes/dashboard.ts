import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController";
import { authMiddleware } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/", getDashboard);
