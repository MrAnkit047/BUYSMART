import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { calcOrderPricing } from "../utils/pricing.js";

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
