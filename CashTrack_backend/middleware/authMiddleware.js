import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user information to req.user
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
