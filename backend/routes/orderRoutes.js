import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  getOrders,
  updateOrderStatus,
  initiateEsewaOrder,
  verifyEsewaOrder,
  initiateKhaltiOrder,
  verifyKhaltiOrder,
  initiateFonepayOrder,
  verifyFonepayOrder,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, addOrderItems);
router.get("/", protect, admin, getOrders);
router.get("/mine", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, updateOrderToPaid);
router.put("/:id/status", protect, admin, updateOrderStatus);

// Nepal Payment Gateways: eSewa, Khalti, FonePay
router.post("/:id/pay/esewa-initiate", protect, initiateEsewaOrder);
router.post("/:id/pay/esewa-verify", protect, verifyEsewaOrder);
router.post("/:id/pay/khalti-initiate", protect, initiateKhaltiOrder);
router.post("/:id/pay/khalti-verify", protect, verifyKhaltiOrder);
router.post("/:id/pay/fonepay-initiate", protect, initiateFonepayOrder);
router.post("/:id/pay/fonepay-verify", protect, verifyFonepayOrder);

export default router;
