import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup); // User registration
router.post("/login", login); // User login
router.post("/logout", logout); // User logout

export default router;
