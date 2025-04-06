import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"; // Import dotenv
import connectToMongoDB from "./database/connectToMongodb.js";

import authRoutes from "./routes/auth.route.js";
import expenseRoutes from "./routes/expense.route.js";

// Load environment variables from a .env file if running locally
dotenv.config();

// Use MONGO_URI from environment variables (Azure sets this in App Service Configuration)
const MONGO_URI = process.env.MONGO_URI || "your-fallback-mongo-uri"; // Fallback in case .env is missing
const PORT = process.env.PORT || 8080; // Use the port from environment or default to 8080

const app = express();

// Middleware (Make sure express.json() does NOT interfere with multer)
app.use(cors({ origin: ["http://localhost:8080"], credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Support form submissions
app.use(express.json()); // JSON parsing AFTER file upload handling

// Connect to MongoDB using the MONGO_URI from environment variables
connectToMongoDB(MONGO_URI);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Default Route (Root route)
app.get("/", (req, res) => {
  res.send("Welcome to CashTrack API! Please use the available API routes.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
