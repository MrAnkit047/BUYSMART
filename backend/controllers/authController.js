import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendLoginOtpEmail, sendPasswordResetOtpEmail } from "../utils/sendEmail.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, customUserId } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error("Please provide name, valid Gmail, Nepali mobile number, and password");
  }

  // Validate Gmail ID
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
    res.status(400);
    throw new Error("Please enter a valid Gmail address (ending with @gmail.com)");
  }

  // Validate Nepali phone number
  const cleanPhone = phone.trim();
  if (!/^(?:\+977[- ]?)?9[78]\d{8}$/.test(cleanPhone)) {
    res.status(400);
    throw new Error("Please enter a valid 10-digit Nepali mobile number (starting with 98 or 97)");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this Gmail address already exists");
  }

  let finalCustomerId = undefined;
  if (customUserId && customUserId.trim()) {
    const formattedId = customUserId.trim();
    const customerIdExists = await User.findOne({ customerId: formattedId });
    if (customerIdExists) {
      res.status(400);
      throw new Error("This User ID / Customer ID is already taken. Please choose another.");
    }
    finalCustomerId = formattedId;
  }

  const user = await User.create({
    name,
    email,
    phone: cleanPhone,
    password,
    customerId: finalCustomerId,
  });

  generateToken(res, user._id);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
    customerId: user.customerId,
  });
});

// @desc    Auth user & send 6-digit Gmail login OTP
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    // Admins log in directly using their password (no OTP verification needed)
    if (user.isAdmin) {
      generateToken(res, user._id);
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: true,
        customerId: user.customerId,
      });
    }

    // Customer accounts: require 6-digit Gmail OTP verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp;
    user.loginOtpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send verification code to user's Gmail
    await sendLoginOtpEmail({ user, code: otp });

    res.json({
      requireOtp: true,
      email: user.email,
      message: "A 6-digit login verification code has been sent to your Gmail ID.",
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Verify 6-digit Gmail login OTP & issue session token
// @route   POST /api/auth/verify-login-otp
// @access  Public
export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error("Please provide your Gmail and the 6-digit verification code");
  }

  const user = await User.findOne({ email }).select("+loginOtp +loginOtpExpire");

  if (!user || !user.loginOtp) {
    res.status(400);
    throw new Error("No active verification code found for this account. Please log in again.");
  }

  if (user.loginOtp !== code.trim()) {
    res.status(400);
    throw new Error("Invalid verification code. Please check your Gmail and try again.");
  }

  if (new Date() > user.loginOtpExpire) {
    res.status(400);
    throw new Error("Verification code has expired. Please request a new code.");
  }

  // Clear OTP fields upon successful verification
  user.loginOtp = undefined;
  user.loginOtpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  // Issue HTTP-only JWT cookie
  generateToken(res, user._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
    customerId: user.customerId,
  });
});

// @desc    Resend 6-digit Gmail login OTP
// @route   POST /api/auth/resend-login-otp
// @access  Public
export const resendLoginOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide your Gmail address");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Account not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.loginOtp = otp;
  user.loginOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await sendLoginOtpEmail({ user, code: otp });

  res.json({
    success: true,
    message: "A new 6-digit verification code has been sent to your Gmail ID.",
  });
});

// @desc    Send 6-digit Gmail password reset code
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide your Gmail address");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No account found with this Gmail address");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOtp = otp;
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetOtpEmail({ user, code: otp });

  res.json({
    success: true,
    message: "A 6-digit password reset code has been sent to your Gmail ID.",
  });
});

// @desc    Verify 6-digit code and reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    res.status(400);
    throw new Error("Please provide email, verification code, and your new password");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters long");
  }

  const user = await User.findOne({ email }).select("+password +resetPasswordOtp +resetPasswordExpire");

  if (!user || !user.resetPasswordOtp) {
    res.status(400);
    throw new Error("No active password reset request found. Please request a new code.");
  }

  if (user.resetPasswordOtp !== code.trim()) {
    res.status(400);
    throw new Error("Invalid verification code. Please check your Gmail.");
  }

  if (new Date() > user.resetPasswordExpire) {
    res.status(400);
    throw new Error("Password reset code has expired. Please request a new one.");
  }

  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful! You can now log in with your new password.",
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
});
