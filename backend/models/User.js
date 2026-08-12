import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import generateCustomerId from "../utils/generateCustomerId.js";

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (this.isAdmin) return /^\S+@\S+\.\S+$/.test(v);
          return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(v);
        },
        message: "Please provide a valid Gmail address (ending with @gmail.com)",
      },
    },
    phone: {
      type: String,
      required: function() { return !this.isAdmin; },
      trim: true,
      match: [/^(?:\+977[- ]?)?9[78]\d{8}$/, "Please provide a valid 10-digit Nepali mobile number starting with 98 or 97"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    isAdmin: { type: Boolean, default: false },
    customerId: { type: String, unique: true, sparse: true },
    address: addressSchema,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isNew && !this.customerId && !this.isAdmin) {
    this.customerId = await generateCustomerId();
  }
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
