import mongoose from "mongoose";
import slugify from "slugify";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    brand: { type: String, default: "Generic" },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    images: [String],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    countInStock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String },
    tags: [String],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text", category: "text" });

productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now()
      .toString()
      .slice(-5)}`;
  }
  next();
});

productSchema.virtual("effectivePrice").get(function () {
  return this.discountPrice && this.discountPrice < this.price
    ? this.discountPrice
    : this.price;
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
