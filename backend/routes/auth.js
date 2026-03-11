import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize without a hardcoded fallback to allow process.env to dictate behavior
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let transporter;

// Create a persistent test account for the user's session
const initTransporter = async () => {
  if (transporter) return transporter;
  const account = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
  return transporter;
};

const emailRegex = /^\d{2}(4[gG]1[aA]0)[0-9a-zA-Z]{3}@(srit\.ac\.in|SRIT\.AC\.IN)$/i;

// Register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, branch, year } = req.body;
    email = email.toLowerCase();

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid college email format.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, branch, year });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, branch: user.branch, year: user.year } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Profile
router.get('/profile', requireAuth, (req, res) => {
  res.json(req.user);
});

// Update Profile
router.put('/update', requireAuth, async (req, res) => {
  try {
    const { name, branch, year } = req.body;
    req.user.name = name || req.user.name;
    req.user.branch = branch || req.user.branch;
    req.user.year = year || req.user.year;
    
    await req.user.save();
    res.json({ message: 'Profile updated successfully', user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change Password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const userWithPassword = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    userWithPassword.password = await bcrypt.hash(newPassword, 10);
    await userWithPassword.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forgot Password Email Flow
router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();
    
    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    
    const mailOptions = {
      from: 'support@ask-q.com',
      to: user.email,
      subject: 'Reset corresponding ASK-Q Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f97316; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">ASK-Q</h1>
            </div>
            <div style="padding: 20px; background-color: #ffffff;">
                <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
                <p style="color: #4b5563; line-height: 1.5;">We received a request to reset your ASK-Q account password. Click the button below to choose a new password. This link will expire in 1 hour.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
            </div>
        </div>
      `,
    };

    if (process.env.SENDGRID_API_KEY) {
        await sgMail.send(mailOptions);
        console.log('Real Email sent via Sendgrid API to:', user.email);
    } else {
        console.log('\n=============================================');
        console.log('MOCK EMAIL INTERCEPT: NO SENDGRID KEY FOUND');
        console.log('Sending mock email to:', user.email);
    };

    const currentTransporter = await initTransporter();
    const info = await currentTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    console.log('Real Email sent via Ethereal to:', user.email);
    console.log('Preview URL:', previewUrl);
    
    res.json({ 
      message: 'Password reset link processed successfully.',
      previewUrl: previewUrl 
    });
  } catch (error) {
    console.error('Email sending error:', error.message);
    res.status(500).json({ message: 'Failed to process email reset.', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({ 
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Account
router.delete('/delete', requireAuth, async (req, res) => {
  try {
    await Post.deleteMany({ author: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
