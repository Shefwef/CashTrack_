import { body, validationResult } from "express-validator";

export const validateExpense = [
  body("date")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      if (inputDate > today) {
        throw new Error("Expense date cannot be in the future");
      }
      return true;
    }),
  body("category").isString().notEmpty().withMessage("Category is required"),
  body("amount").isNumeric().withMessage("Amount must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
