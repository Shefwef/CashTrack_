import express from "express";
import { upload } from "../config/multerConfig.js";
import { createExpense } from "../controllers/expenseController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Protect all expense routes
router.use(protectRoute);

router.post("/", upload.array("media"), createExpense);
// Add other CRUD operations here (GET, PUT, DELETE)

export default router;
