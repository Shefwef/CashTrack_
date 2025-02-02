import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match!" });
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ error: "Username already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultProfilePic = `https://avatar.iran.liara.run/public/default?username=${username}`;

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic: defaultProfilePic,
    });

    await newUser.save();

    generateTokenAndSetCookie(newUser._id, res);
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password!" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};
