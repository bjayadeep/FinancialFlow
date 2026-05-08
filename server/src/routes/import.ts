import { Router } from "express";
import multer from "multer";
import { importCsv } from "../controllers/importController";
import { authMiddleware } from "../middleware/auth";

export const importRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      callback(null, true);
      return;
    }

    callback(new Error("Only CSV files are supported"));
  },
});

importRouter.post("/csv", authMiddleware, upload.single("file"), importCsv);
