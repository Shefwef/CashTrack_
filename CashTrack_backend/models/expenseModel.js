import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  paymentMethod: { type: String },
  date: { type: Date, default: Date.now },
  media: [
    {
      fileType: { type: String, enum: ["image", "pdf"], required: true },
      filePath: { type: String, required: true },
    },
  ],
});

export const Expense = mongoose.model("Expense", expenseSchema);
