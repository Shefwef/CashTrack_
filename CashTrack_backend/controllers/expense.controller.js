import Expense from "../models/expense.model.js";
import PDFDocument from "pdfkit";
import multer from "multer";
import fs from "fs";
import path from "path";
import { uploadSingle } from "../config/multer.config.js";
import { fileURLToPath } from "url";
import { createObjectCsvWriter } from "csv-writer";

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

// Fix __dirname in ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    uploadSingle(req, res, async (err) => {
      if (err && err.code !== "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: err.message });
      }

      const { id } = req.params;
      const { date, category, amount, description, paymentMethod } = req.body;

      // Find existing expense
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
        updatedFields.mediaFile = req.file.path;
      }

      // Update the expense in DB
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

    // Find the expense in DB
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found!" });
    }

    // If an associated media file exists, delete it
    if (expense.mediaFile) {
      fs.unlink(expense.mediaFile, (err) => {
        if (err) {
          console.error("Error deleting media file:", err);
        } else {
          console.log("✅ Media file deleted successfully:", expense.mediaFile);
        }
      });
    }

    // Delete expense from DB
    await Expense.findByIdAndDelete(id);

    res.status(200).json({ message: "Expense deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting expense:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// View media file
export const viewMedia = async (req, res) => {
  try {
    const { filePath } = req.params;
    const absolutePath = path.join(__dirname, "../uploads", filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "File not found!" });
    }

    res.sendFile(absolutePath);
  } catch (error) {
    console.error("Error retrieving media file:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the expense record
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found!" });
    }

    if (!expense.mediaFile) {
      return res
        .status(400)
        .json({ error: "No media file attached to this expense!" });
    }

    // Delete the media file from storage
    fs.unlink(expense.mediaFile, async (err) => {
      if (err) {
        console.error("Error deleting media file:", err);
        return res.status(500).json({ error: "Failed to delete media file" });
      }

      // Remove media file path from expense record in DB
      expense.mediaFile = null;
      await expense.save();

      res.status(200).json({ message: "Media file deleted successfully!" });
    });
  } catch (error) {
    console.error("Error deleting media file:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const generateReport = async (req, res) => {
  try {
    const { format, startDate, endDate, category } = req.query;

    let filters = {};
    if (startDate && endDate) {
      filters.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) filters.category = category;

    const expenses = await Expense.find(filters).sort({ date: -1 });

    if (!expenses.length) {
      return res
        .status(404)
        .json({ error: "No expenses found for the given filters." });
    }

    if (format === "pdf") {
      generatePDFReport(expenses, res);
    } else if (format === "csv") {
      generateCSVReport(expenses, res);
    } else {
      return res
        .status(400)
        .json({ error: "Invalid format! Use 'pdf' or 'csv'." });
    }
  } catch (error) {
    console.error("Error generating report:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to generate a PDF report
const generatePDFReport = (expenses, res) => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, "../reports/expense_report.pdf");

  // Ensure reports directory exists
  if (!fs.existsSync(path.join(__dirname, "../reports"))) {
    fs.mkdirSync(path.join(__dirname, "../reports"), { recursive: true });
  }

  doc.pipe(fs.createWriteStream(filePath));
  doc.pipe(res);

  doc.fontSize(16).text("Expense Report", { align: "center" });
  doc.moveDown();
  expenses.forEach((expense, index) => {
    doc
      .fontSize(12)
      .text(
        `${index + 1}. ${expense.date.toISOString().split("T")[0]} - ${
          expense.category
        } - $${expense.amount}`,
        { indent: 20 }
      );
  });

  doc.end();
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=expense_report.pdf"
  );
  res.setHeader("Content-Type", "application/pdf");
};

// Function to generate a CSV report
const generateCSVReport = async (expenses, res) => {
  const filePath = path.join(__dirname, "../reports/expense_report.csv");

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "date", title: "Date" },
      { id: "category", title: "Category" },
      { id: "amount", title: "Amount" },
      { id: "description", title: "Description" },
      { id: "paymentMethod", title: "Payment Method" },
    ],
  });

  const csvData = expenses.map((expense) => ({
    date: expense.date.toISOString().split("T")[0],
    category: expense.category,
    amount: expense.amount,
    description: expense.description || "N/A",
    paymentMethod: expense.paymentMethod,
  }));

  await csvWriter.writeRecords(csvData);

  res.download(filePath, "expense_report.csv", (err) => {
    if (err) {
      console.error("Error sending CSV report:", err);
      res.status(500).json({ error: "Failed to download CSV report." });
    }
  });
};

//
// export const viewMedia = (req, res) => {
//   const { filePath } = req.params;

//   const absolutePath = path.join(__dirname, "../uploads", filePath);
//   if (fs.existsSync(absolutePath)) {
//     res.sendFile(absolutePath);
//   } else {
//     res.status(404).json({ error: "File not found!" });
//   }
// };
