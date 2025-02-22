import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String }, // Only for JWT-based users
    googleId: { type: String }, // For Google OAuth users
    facebookId: { type: String }, // For Facebook OAuth users
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
