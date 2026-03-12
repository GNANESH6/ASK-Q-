import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let transporter;

const initTransporter = async () => {
  if (transporter) return transporter;

  const account = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });

  return transporter;
};

const emailRegex = /^\d{2}(4[gG]1[aA]0)[0-9a-zA-Z]{3}@(srit\.ac\.in|SRIT\.AC\.IN)$/i;



// Register
router.post("/register", async (req, res) => {
  try {

    let { name, email, password, branch, year } = req.body;

    email = email.toLowerCase();

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid college email format." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      branch,
      year
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully."
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
});



// Login
router.post("/login", async (req, res) => {
  try {

    let { email, password } = req.body;

    email = email.toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year
      }
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
});



// Profile
router.get("/profile", requireAuth, (req, res) => {
  res.json(req.user);
});



// Update Profile
router.put("/update", requireAuth, async (req, res) => {
  try {

    const { name, branch, year } = req.body;

    const user = await User.findById(req.user._id);

    user.name = name || user.name;
    user.branch = branch || user.branch;
    user.year = year || user.year;

    await user.save();

    // Update posts created by this user
    await Post.updateMany(
      { author: user._id },
      {
        $set: {
          "author.name": user.name,
          "author.branch": user.branch,
          "author.year": user.year
        }
      }
    );

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year
      }
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
});



// Change Password
router.post("/change-password", requireAuth, async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
});



// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {

    const email = req.body.email.toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;

    await user.save();

    const resetUrl =
      `https://ask-q-six.vercel.app/reset-password/${token}`;

    const mailOptions = {
      from: "support@ask-q.com",
      to: user.email,
      subject: "Reset ASK-Q Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    };

    const currentTransporter = await initTransporter();

    const info = await currentTransporter.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      message: "Password reset email sent.",
      previewUrl
    });

  } catch (error) {

    console.error("Email error:", error);

    res.status(500).json({
      message: "Failed to process email reset."
    });

  }
});



// Reset Password
router.post("/reset-password", async (req, res) => {
  try {

    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
});



// Delete Account
router.delete("/delete", requireAuth, async (req, res) => {
  try {

    await Post.deleteMany({ author: req.user._id });

    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "Account deleted successfully" });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
});

export default router;