import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatNPR } from "../utils/currency.js";
import { calcOrderPricing } from "../utils/pricing.js";
import Message from "../components/Message.jsx";

const emptyAddress = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nepal",
  phone: "",
};

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    ...emptyAddress,
    fullName: user?.name || "",
    phone: user?.phone || "",
    ...(user?.address || {}),
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { shippingPrice, taxPrice, totalPrice } = calcOrderPricing(subtotal);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        orderItems: items.map((i) => ({ product: i.productId, qty: i.qty })),
        shippingAddress: address,
        paymentMethod,
      });
      clearCart();
      const redirectUrl =
        paymentMethod === "Cash on Delivery"
          ? `/orders/${data._id}`
          : `/orders/${data._id}?payNow=${paymentMethod}`;
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">Checkout Order</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Shipping Address */}
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-teal" />
              <h2 className="font-display text-lg font-semibold text-ink">Delivery Address in Nepal</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                name="fullName"
                value={address.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="input"
              />
              <input
                required
                name="phone"
                value={address.phone}
                onChange={handleChange}
                placeholder="Contact Phone (e.g. 9841234567)"
                className="input"
              />
              <input
                required
                name="line1"
                value={address.line1}
                onChange={handleChange}
                placeholder="Street Address / Tole (e.g. Lazimpat, Ward 2)"
                className="input sm:col-span-2"
              />
              <input
                name="line2"
                value={address.line2}
                onChange={handleChange}
                placeholder="Landmark / House No. (Optional)"
                className="input sm:col-span-2"
              />
              <input
                required
                name="city"
                value={address.city}
                onChange={handleChange}
                placeholder="City (e.g. Kathmandu, Pokhara)"
                className="input"
              />
              <input
                name="state"
                value={address.state}
                onChange={handleChange}
                placeholder="Province / State (e.g. Bagmati)"
                className="input"
              />
              <input
                required
                name="postalCode"
                value={address.postalCode}
                onChange={handleChange}
                placeholder="Postal Code (e.g. 44600)"
                className="input"
              />
              <input
                required
                name="country"
                value={address.country}
                onChange={handleChange}
                placeholder="Country"
                className="input"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-teal" />
              <h2 className="font-display text-lg font-semibold text-ink">Select Nepal Payment Option</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "eSewa",
                  name: "eSewa Mobile Wallet",
                  badge: "ePay v2",
                  badgeClass: "bg-emerald-600 text-white",
                  desc: "Direct payment with eSewa ID & credentials",
                  icon: "🟢",
                },
                {
                  id: "Khalti",
                  name: "Khalti Digital Wallet",
                  badge: "Khalti Pay",
                  badgeClass: "bg-purple-600 text-white",
                  desc: "Pay via Khalti app, web, or mobile banking",
                  icon: "🟣",
                },
                {
                  id: "FonePay",
                  name: "FonePay / All Banks QR",
                  badge: "Dynamic QR",
                  badgeClass: "bg-rose-600 text-white",
                  desc: "Scan with any Nepali bank app or mobile wallet",
                  icon: "🔴",
                },
                {
                  id: "Cash on Delivery",
                  name: "Cash on Delivery (COD)",
                  badge: "Doorstep",
                  badgeClass: "bg-neutral-600 text-white",
                  desc: "Pay cash when your order arrives at your door",
                  icon: "💵",
                },
              ].map((opt) => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`relative flex flex-col justify-between rounded-xl border-2 p-4 cursor-pointer transition ${
                      isSelected
                        ? "border-teal bg-teal/5 shadow-sm"
                        : "border-ink/10 bg-white hover:border-ink/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{opt.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-ink">{opt.name}</div>
                          <div className="text-xs text-ink/50 mt-0.5">{opt.desc}</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.id}
                        checked={isSelected}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-teal h-4 w-4 mt-0.5"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-2 text-[11px]">
                      <span className="font-medium text-ink/60">Gateway status</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${opt.badgeClass}`}>
                        {opt.badge}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-ink/40">
              🔒 All transactions are secured through standard encryption and verified directly with payment providers.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Order Summary</h2>
          <div className="mt-4 space-y-3 text-sm text-ink/70">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-mono font-semibold">{formatNPR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-mono font-semibold">
                {shippingPrice === 0 ? <span className="text-teal">FREE</span> : formatNPR(shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>VAT (13%)</span>
              <span className="font-mono font-semibold">{formatNPR(taxPrice)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-base font-bold text-ink">
              <span>Grand Total</span>
              <span className="font-mono text-teal">{formatNPR(totalPrice)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4">
              <Message type="error">{error}</Message>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 font-semibold text-white transition hover:bg-teal disabled:opacity-60 shadow-lg shadow-ink/10"
          >
            {submitting ? "Placing Order…" : "Place Order Now"} <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Checkout;
