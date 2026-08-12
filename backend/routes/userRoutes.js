import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/", protect, admin, getUsers);
router.delete("/:id", protect, admin, deleteUser);

export default router;
