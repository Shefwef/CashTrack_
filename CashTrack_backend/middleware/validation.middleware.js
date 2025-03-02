import { body, validationResult } from "express-validator";

export const validateExpense = [
  body("date").custom((value, { req }) => {
    const date = req.body.date || req.body["date"];
    if (!date) {
      throw new Error("Date is required");
    }
    if (isNaN(Date.parse(date))) {
      throw new Error("Invalid date format");
    }
    const inputDate = new Date(date);
    const today = new Date();
    if (inputDate > today) {
      throw new Error("Expense date cannot be in the future");
    }
    return true;
  }),
  body("category").custom((value, { req }) => {
    const category = req.body.category || req.body["category"];
    if (!category) {
      throw new Error("Category is required");
    }
    return true;
  }),
  body("amount").custom((value, { req }) => {
    const amount = req.body.amount || req.body["amount"];
    if (!amount || isNaN(amount)) {
      throw new Error("Amount must be a number");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
