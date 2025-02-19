import express from "express";
import { uploadSingle } from "../config/multer.config.js";
import authenticate from "../middleware/auth.middleware.js";
import { validateExpense } from "../middleware/validation.middleware.js";
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  viewMedia,
  deleteMedia,
  generateReport,
} from "../controllers/expense.controller.js";

const router = express.Router();

// ✅ Create an expense (with media upload + validation)
router.post("/", authenticate, uploadSingle, validateExpense, createExpense);

// ✅ Get all expenses (with filters)
router.get("/", authenticate, getExpenses);

// ✅ Update an expense (replace media if new file is uploaded)
router.patch(
  "/:id",
  authenticate,
  uploadSingle,
  validateExpense,
  updateExpense
);

// ✅ Delete an expense
router.delete("/:id", authenticate, deleteExpense);

// ✅ View media file (returns the file itself)
router.get("/media/:filePath", viewMedia);

// ✅ Delete only the media file (keep the expense record)
router.delete("/media/:id", authenticate, deleteMedia);

// ✅ Generate report (PDF/CSV)
router.get("/report", authenticate, generateReport);

export default router;
