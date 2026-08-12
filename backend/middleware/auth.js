import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/User.js";

// Protect routes - user must be logged in
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.jwt;

  // Also allow Authorization: Bearer <token> header for API clients
  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// Restrict to admin users
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};
