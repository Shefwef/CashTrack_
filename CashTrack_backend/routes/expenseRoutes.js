import express from "express";
import { upload } from "../config/multerConfig.js";
import { createExpense } from "../controllers/expenseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply JWT authentication middleware
router.use(authMiddleware);

router.post("/", upload.array("media"), createExpense);

export default router;
