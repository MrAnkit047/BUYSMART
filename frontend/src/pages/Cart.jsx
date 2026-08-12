import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatNPR } from "../utils/currency.js";
import Message from "../components/Message.jsx";

const Cart = () => {
  const { items, updateQty, removeFromCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate(user ? "/checkout" : "/login?redirect=/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink/5 text-ink/40">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">Your Shopping Cart is Empty</h1>
        <p className="mt-2 text-sm text-ink/50">Explore our catalog and find high-quality products with deals in NPR.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 font-semibold text-white transition hover:bg-teal shadow-md"
        >
          Explore Catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Shopping Cart ({items.length} items)</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-display text-sm font-semibold text-ink transition hover:text-teal"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-ink/40 transition hover:text-red-600"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <select
                    value={item.qty}
                    onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                    className="rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-teal"
                  >
                    {Array.from({ length: Math.min(item.countInStock || 10, 10) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        Qty: {n}
                      </option>
                    ))}
                  </select>
                  <span className="font-mono font-bold text-ink">
                    {formatNPR(item.qty * item.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span className="font-mono font-semibold">{formatNPR(subtotal)}</span>
          </div>
          <p className="mt-1.5 text-xs text-ink/40">
            Shipping & 13% VAT calculated during checkout step.
          </p>

          <button
            onClick={handleCheckout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 font-semibold text-white transition hover:bg-teal shadow-lg shadow-ink/10"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>

          {!user && (
            <div className="mt-4">
              <Message type="info">You will be asked to log in before completing your order.</Message>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
