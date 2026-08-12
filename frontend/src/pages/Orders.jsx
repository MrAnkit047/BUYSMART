import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Message from "../components/Message.jsx";
import PriceTag from "../components/PriceTag.jsx";
import { formatNPR } from "../utils/currency.js";

const statusTone = {
  Processing: "muted",
  Shipped: "teal",
  Delivered: "accent",
  Cancelled: "muted",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/mine")
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your orders" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl px-4 py-10 sm:px-6"
    >
      <h1 className="font-display text-2xl font-bold text-ink">My Order History</h1>

      {error && (
        <div className="mt-4">
          <Message type="error">{error}</Message>
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-ink/8 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink/5 text-ink/40">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-ink/70">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" /> Start Shopping
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm transition hover:border-teal hover:shadow-md"
          >
            <div>
              <p className="font-mono text-xs font-semibold text-ink/50">
                Order #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-ink/60">
                {new Date(order.createdAt).toLocaleDateString("en-NP")} · {order.orderItems.length} items
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-ink">{formatNPR(order.totalPrice)}</span>
              <PriceTag tone={statusTone[order.status] || "muted"}>{order.status}</PriceTag>
              <ChevronRight className="h-4 w-4 text-ink/30" />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default Orders;
