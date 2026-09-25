import express from "express";
import {
  registerUser,
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  resetPassword,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/resend-login-otp", resendLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", protect, logoutUser);

export default router;
