import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { alertsRouter } from "./routes/alerts";
import { authRouter } from "./routes/auth";
import { budgetsRouter } from "./routes/budgets";
import { chatRouter } from "./routes/chat";
import { dashboardRouter } from "./routes/dashboard";
import { importRouter } from "./routes/import";
import { transactionsRouter } from "./routes/transactions";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://financial-flow-iota.vercel.app",
    process.env.CLIENT_URL || "",
  ],
  credentials: true,
}));
app.use(express.json());
app.use("/api/alerts", alertsRouter);
app.use("/api/auth", authRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/import", importRouter);
app.use("/api/transactions", transactionsRouter);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
