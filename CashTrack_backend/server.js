import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport.js";
import connectToMongoDB from "./database/connectToMongodb.js";

import authRoutes from "./routes/auth.route.js";
import expenseRoutes from "./routes/expense.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 80;

// Session Middleware 🔥
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors({ origin: ["http://localhost:8080"], credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB Connection
connectToMongoDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
