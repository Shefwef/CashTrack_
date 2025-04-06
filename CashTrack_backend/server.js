import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToMongoDB from "./database/connectToMongodb.js";

import authRoutes from "./routes/auth.route.js";
import expenseRoutes from "./routes/expense.route.js";

// Hardcode MongoDB URI and Port
const MONGO_URI =
  "mongodb+srv://shefadib:PzbnDZ4JlZFEqT24@cluster0.kivwk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const PORT = 8080;

const app = express();

// Middleware (Make sure express.json() does NOT interfere with multer)
app.use(cors({ origin: ["http://localhost:8080"], credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Support form submissions
app.use(express.json()); // JSON parsing AFTER file upload handling

// Connect to MongoDB using hardcoded MONGO_URI
connectToMongoDB(MONGO_URI);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
