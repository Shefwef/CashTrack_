import express from "express";
import { upload } from "../config/multer.config.js"; // Import multer configuration
import authenticate from "../middleware/auth.middleware.js"; // Authentication middleware
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  viewMedia,
} from "../controllers/expense.controller.js";

const router = express.Router();

// CRUD routes with file uploads
router.post("/", authenticate, upload.single("mediaFile"), createExpense); // Create an expense with media
router.get("/", authenticate, getExpenses); // Get all expenses with filters
router.put("/:id", authenticate, upload.single("mediaFile"), updateExpense); // Update an expense with media
router.delete("/:id", authenticate, deleteExpense); // Delete an expense
router.get("/media/:filePath", viewMedia); // View media file

export default router;
