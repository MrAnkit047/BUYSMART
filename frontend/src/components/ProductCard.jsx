import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Rating from "./Rating.jsx";
import PriceTag from "./PriceTag.jsx";
import { formatNPR } from "../utils/currency.js";
import { useCart } from "../context/CartContext.jsx";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const pct = hasDiscount
    ? Math.round(100 - (product.discountPrice / product.price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm transition hover:shadow-xl hover:shadow-ink/5"
    >
      <Link
        to={`/products/${product.slug || product._id}`}
        className="relative block aspect-square overflow-hidden bg-ink50"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <div className="absolute left-3 top-3">
            <PriceTag tone="accent">-{pct}% OFF</PriceTag>
          </div>
        )}
        {product.countInStock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60 backdrop-blur-[2px]">
            <PriceTag tone="muted">Out of stock</PriceTag>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-teal">
          {product.category}
        </span>
        <Link
          to={`/products/${product.slug || product._id}`}
          className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink transition hover:text-teal"
        >
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.numReviews} />

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col font-mono">
            <span className="text-base font-bold text-ink">
              {formatNPR(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-ink/40 line-through">
                {formatNPR(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.countInStock === 0}
            className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-teal disabled:cursor-not-allowed disabled:bg-ink/20"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
