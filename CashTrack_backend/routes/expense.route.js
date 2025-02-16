import express from "express";
import { uploadSingle } from "../config/multer.config.js";
import authenticate from "../middleware/auth.middleware.js";
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

// CRUD routes with file uploads
router.post("/", authenticate, uploadSingle, createExpense); // Create an expense with media
router.get("/", authenticate, getExpenses); // Get all expenses with filters
router.patch("/:id", authenticate, updateExpense); // Update expense + replace media file
router.delete("/:id", authenticate, deleteExpense); // Delete an expense
router.get("/media/:filePath", viewMedia); // View media file
router.delete("/media/:id", authenticate, deleteMedia); // Delete media file from an expense
router.get("/report", authenticate, generateReport); // Generate a report

export default router;
