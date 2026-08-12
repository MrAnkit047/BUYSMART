import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    price: Number,
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, sparse: true },
    customerId: { type: String, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, required: true, default: "Cash on Delivery" },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
