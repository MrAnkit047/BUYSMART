import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { calcOrderPricing } from "../utils/pricing.js";
import { sendOrderConfirmationEmail } from "../utils/sendEmail.js";
import {
  createEsewaPaymentPayload,
  verifyEsewaPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  createFonepayPayload,
} from "../utils/nepalPayments.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Re-price items server-side from the database (never trust client prices)
  const detailedItems = await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`Not enough stock for ${product.name}`);
      }
      const price =
        product.discountPrice && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;
      return {
        product: product._id,
        name: product.name,
        image: product.image,
        price,
        qty: item.qty,
      };
    })
  );

  const itemsPrice = detailedItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const { shippingPrice, taxPrice, totalPrice } = calcOrderPricing(itemsPrice);

  const order = new Order({
    customerId: req.user.customerId,
    user: req.user._id,
    orderItems: detailedItems,
    shippingAddress,
    paymentMethod: paymentMethod || "Cash on Delivery",
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  const created = await order.save();

  // Decrement stock
  await Promise.all(
    detailedItems.map((i) =>
      Product.findByIdAndUpdate(i.product, { $inc: { countInStock: -i.qty } })
    )
  );

  // Send order confirmation email asynchronously to customer's Gmail ID
  sendOrderConfirmationEmail({ order: created, user: req.user }).catch((err) => {
    console.error("Error triggering order confirmation email:", err);
  });

  res.status(201).json(created);
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/mine
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by id
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email customerId");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json(order);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  const updated = await order.save();
  res.json(updated);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email customerId").sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status / delivery
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = req.body.status || order.status;
  if (req.body.status === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updated = await order.save();
  res.json(updated);
});

// @desc    Initiate eSewa v2 ePay payment
// @route   POST /api/orders/:id/pay/esewa-initiate
// @access  Private
export const initiateEsewaOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const payload = createEsewaPaymentPayload(order, clientUrl);

  res.json(payload);
});

// @desc    Verify eSewa v2 payment callback
// @route   POST /api/orders/:id/pay/esewa-verify
// @access  Private
export const verifyEsewaOrder = asyncHandler(async (req, res) => {
  const { encodedData } = req.body;
  if (!encodedData) {
    res.status(400);
    throw new Error("Missing encoded data from eSewa response");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const result = verifyEsewaPayment(encodedData, order);
  if (!result.success) {
    res.status(400);
    throw new Error(result.message || "eSewa verification failed");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentMethod = "eSewa";
  order.paymentResult = {
    id: result.transactionId,
    status: "Completed",
    gateway: "eSewa",
    updateTime: new Date().toISOString(),
    rawResponse: result.raw,
  };

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

// @desc    Initiate Khalti v2 ePayment
// @route   POST /api/orders/:id/pay/khalti-initiate
// @access  Private
export const initiateKhaltiOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const result = await initiateKhaltiPayment(order, req.user, clientUrl);

  res.json(result);
});

// @desc    Verify Khalti payment
// @route   POST /api/orders/:id/pay/khalti-verify
// @access  Private
export const verifyKhaltiOrder = asyncHandler(async (req, res) => {
  const { pidx } = req.body;
  if (!pidx) {
    res.status(400);
    throw new Error("Missing pidx parameter");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const result = await verifyKhaltiPayment(pidx);
  if (!result.success) {
    res.status(400);
    throw new Error(result.message || "Khalti payment verification failed");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentMethod = "Khalti";
  order.paymentResult = {
    id: result.transactionId,
    status: result.status,
    gateway: "Khalti",
    updateTime: new Date().toISOString(),
    rawResponse: result.raw,
  };

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

// @desc    Initiate FonePay QR payment payload
// @route   POST /api/orders/:id/pay/fonepay-initiate
// @access  Private
export const initiateFonepayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const payload = createFonepayPayload(order);
  res.json(payload);
});

// @desc    Verify FonePay QR payment
// @route   POST /api/orders/:id/pay/fonepay-verify
// @access  Private
export const verifyFonepayOrder = asyncHandler(async (req, res) => {
  const { traceId } = req.body;
  if (!traceId) {
    res.status(400);
    throw new Error("Missing FonePay trace ID");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentMethod = "FonePay";
  order.paymentResult = {
    id: traceId,
    status: "Completed",
    gateway: "FonePay",
    updateTime: new Date().toISOString(),
    rawResponse: { traceId, method: "QR Scan" },
  };

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

