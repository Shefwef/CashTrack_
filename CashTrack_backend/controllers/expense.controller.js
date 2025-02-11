import Expense from "../models/expense.model.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "./uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPG, PNG, and PDF files are allowed!"
        )
      );
    }
  },
}).single("mediaFile");

// Create a new expense
export const createExpense = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { date, category, amount, description, paymentMethod } = req.body;

    if (!date || !category || !amount || !paymentMethod) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newExpense = new Expense({
      userId: req.userID,
      date,
      category,
      amount,
      description,
      paymentMethod,
      mediaFile: req.file ? req.file.path : null, // Store file path if uploaded
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error creating expense:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Read all expenses with filtering options
export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const query = { userId: req.userID };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (category) query.category = category;

    const expenses = await Expense.find(query);
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update an expense
export const updateExpense = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { id } = req.params;
      const { date, category, amount, description, paymentMethod } = req.body;

      // Find the existing expense to check for an old media file
      const existingExpense = await Expense.findById(id);
      if (!existingExpense) {
        return res.status(404).json({ error: "Expense not found!" });
      }

      const updatedFields = {
        date,
        category,
        amount,
        description,
        paymentMethod,
      };

      // If a new media file is uploaded, delete the old one first
      if (req.file) {
        if (existingExpense.mediaFile) {
          fs.unlink(existingExpense.mediaFile, (err) => {
            if (err) console.error("Error deleting old media file:", err);
          });
        }
        updatedFields.mediaFile = req.file.path; // Save new file path
      }

      const updatedExpense = await Expense.findByIdAndUpdate(
        id,
        updatedFields,
        { new: true }
      );

      res.status(200).json(updatedExpense);
    });
  } catch (error) {
    console.error("Error updating expense:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete an expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found!" });
    }

    if (expense.mediaFile) {
      fs.unlinkSync(expense.mediaFile);
    }

    res.status(200).json({ message: "Expense deleted successfully!" });
  } catch (error) {
    console.error("Error deleting expense:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// View media file
export const viewMedia = (req, res) => {
  const { filePath } = req.params;

  const absolutePath = path.join(__dirname, "../uploads", filePath);
  if (fs.existsSync(absolutePath)) {
    res.sendFile(absolutePath);
  } else {
    res.status(404).json({ error: "File not found!" });
  }
};
