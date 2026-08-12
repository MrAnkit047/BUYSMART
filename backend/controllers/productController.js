import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/Product.js";

// @desc    Fetch products with search, filter, sort, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? { $text: { $search: req.query.keyword } }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};

  const priceFilter = {};
  if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
  const price = Object.keys(priceFilter).length ? { price: priceFilter } : {};

  const filter = { ...keyword, ...category, ...price };

  let sort = { createdAt: -1 };
  if (req.query.sort === "price_asc") sort = { price: 1 };
  if (req.query.sort === "price_desc") sort = { price: -1 };
  if (req.query.sort === "rating") sort = { rating: -1 };
  if (req.query.sort === "newest") sort = { createdAt: -1 };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Fetch featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json(products);
});

// @desc    Get distinct categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories);
});

// @desc    Fetch single product by id or slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  const product = isObjectId
    ? await Product.findById(id)
    : await Product.findOne({ slug: id });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: req.body.name || "Sample Name",
    description: req.body.description || "Sample description",
    brand: req.body.brand || "Sample Brand",
    category: req.body.category || "Uncategorized",
    image: req.body.image || "/uploads/placeholder.jpg",
    price: req.body.price ?? 0,
    discountPrice: req.body.discountPrice,
    countInStock: req.body.countInStock ?? 0,
    images: req.body.images || [],
    tags: req.body.tags || [],
    isFeatured: req.body.isFeatured || false,
  });

  const created = await product.save();
  res.status(201).json(created);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = [
    "name",
    "description",
    "brand",
    "category",
    "image",
    "images",
    "price",
    "discountPrice",
    "countInStock",
    "tags",
    "isFeatured",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ message: "Product removed" });
});

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
});
