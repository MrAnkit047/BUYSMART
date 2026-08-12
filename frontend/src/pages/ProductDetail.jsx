import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, CheckCircle, PackageX, Star, ShieldCheck, Truck } from "lucide-react";
import api from "../api/axios.js";
import Rating from "../components/Rating.jsx";
import PriceTag from "../components/PriceTag.jsx";
import Loader from "../components/Loader.jsx";
import Message from "../components/Message.jsx";
import { formatNPR } from "../utils/currency.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const loadProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setQty(1);
    } catch (err) {
      setError(err.response?.data?.message || "Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    try {
      await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess("Thanks — your review has been posted!");
      setReviewComment("");
      loadProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not submit review");
    }
  };

  if (loading) return <Loader label="Loading product details" />;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Message type="error">{error}</Message>
      </div>
    );
  if (!product) return null;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const pct = hasDiscount
    ? Math.round(100 - (product.discountPrice / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink/60 transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
          />
          {hasDiscount && (
            <div className="absolute left-4 top-4">
              <PriceTag tone="accent">-{pct}% OFF</PriceTag>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-teal">
            {product.category}
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink leading-tight">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} count={product.numReviews} />
            <span className="text-xs font-medium text-ink/40">Brand: {product.brand}</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3 font-mono">
            <span className="text-3xl font-bold text-ink">
              {formatNPR(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-ink/40 line-through">
                {formatNPR(product.price)}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink/70">{product.description}</p>

          <div className="mt-6 flex items-center gap-2">
            {product.countInStock > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                <CheckCircle className="h-3.5 w-3.5" /> In Stock ({product.countInStock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                <PackageX className="h-3.5 w-3.5" /> Currently Out of Stock
              </span>
            )}
          </div>

          {product.countInStock > 0 && (
            <div className="mt-8 flex items-center gap-3">
              <select
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="rounded-xl border border-ink/15 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-teal"
              >
                {Array.from({ length: Math.min(product.countInStock, 10) }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      Qty: {n}
                    </option>
                  )
                )}
              </select>
              <button
                onClick={() => addToCart(product, qty)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 font-semibold text-white transition hover:bg-teal shadow-lg shadow-ink/10"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ink/8 pt-6">
            <div className="flex items-center gap-2.5 text-xs font-medium text-ink/70">
              <Truck className="h-4 w-4 text-teal" /> Delivery across Nepal
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-ink/70">
              <ShieldCheck className="h-4 w-4 text-teal" /> 100% Genuine Guarantee
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-16 border-t border-ink/8 pt-10">
        <h2 className="font-display text-xl font-bold text-ink">Customer Reviews</h2>

        {product.reviews.length === 0 && (
          <p className="mt-3 text-sm text-ink/50">
            No reviews yet — be the first customer to review this product.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {product.reviews.map((r) => (
            <div key={r._id} className="rounded-xl border border-ink/8 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">{r.name}</span>
                <Rating value={r.rating} />
              </div>
              <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-lg rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
          <h3 className="font-display text-base font-semibold text-ink">Write a Review</h3>
          {user ? (
            <form onSubmit={submitReview} className="mt-4 space-y-4">
              {reviewError && <Message type="error">{reviewError}</Message>}
              {reviewSuccess && <Message type="success">{reviewSuccess}</Message>}

              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-teal"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars — {["Poor", "Fair", "Good", "Very Good", "Excellent"][n - 1]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Comment</label>
                <textarea
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this product..."
                  className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-teal"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-ink/60">
              Please{" "}
              <Link to="/login" className="font-semibold text-teal hover:underline">
                log in
              </Link>{" "}
              to leave a review.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
