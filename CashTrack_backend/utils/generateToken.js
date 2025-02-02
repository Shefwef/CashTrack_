import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const generateTokenAndSetCookie = (userID, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not set in the environment variables!");
      return res
        .status(500)
        .json({ error: "Internal Server Error: Missing JWT_SECRET" });
    }

    const token = jwt.sign({ userID }, JWT_SECRET, {
      expiresIn: "15d",
    });

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "Strict",
    });

    return token; // Return token for API responses
  } catch (error) {
    console.error("Error generating JWT token:", error.message);
    return res
      .status(500)
      .json({ error: "Internal Server Error: Token generation failed" });
  }
};

export default generateTokenAndSetCookie;
