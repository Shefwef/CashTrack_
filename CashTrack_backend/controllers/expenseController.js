import { Expense } from "../models/expenseModel.js";

// Create Expense
export const createExpense = async (req, res) => {
  try {
    const { category, amount, description, paymentMethod } = req.body;
    const files = req.files.map((file) => ({
      fileType: file.mimetype === "application/pdf" ? "pdf" : "image",
      filePath: file.path,
    }));

    const expense = new Expense({
      user: req.user.id, // Assuming req.user is populated via auth middleware
      category,
      amount,
      description,
      paymentMethod,
      media: files,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to create expense", error });
  }
};
