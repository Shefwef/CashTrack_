import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToMongoDB from "./database/connectToMongodb.js";

import authRoutes from "./routes/auth.route.js";
import expenseRoutes from "./routes/expense.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Make sure express.json() does NOT interfere with multer)
app.use(cors({ origin: ["http://localhost:5000"], credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Support form submissions
app.use(express.json()); // JSON parsing AFTER file upload handling

// Connect to MongoDB
connectToMongoDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
