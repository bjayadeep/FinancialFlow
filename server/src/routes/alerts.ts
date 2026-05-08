import { Router } from "express";
import { getAlerts, scanAlerts, updateAlert } from "../controllers/alertController";
import { authMiddleware } from "../middleware/auth";

export const alertsRouter = Router();

alertsRouter.use(authMiddleware);

alertsRouter.get("/", getAlerts);
alertsRouter.post("/scan", scanAlerts);
alertsRouter.put("/:id", updateAlert);
