import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

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

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      customerId: user.customerId,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
});
