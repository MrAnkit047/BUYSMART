import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Message from "../../components/Message.jsx";
import PriceTag from "../../components/PriceTag.jsx";
import { formatNPR } from "../../utils/currency.js";

const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader label="Loading orders management" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <h1 className="mb-2 font-display text-2xl font-bold text-white">Manage Orders</h1>
      <p className="mb-6 text-xs text-white/50">Track customer orders, update delivery status, and review total sales.</p>

      {error && <Message type="error">{error}</Message>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-inkdark font-mono text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-5 py-3.5">Order ID</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Total (NPR)</th>
              <th className="px-5 py-3.5">Payment</th>
              <th className="px-5 py-3.5">Delivery Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-white/40">
                  No orders placed yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="hover:bg-white/5 transition">
                  <td className="px-5 py-3.5">
                    <Link to={`/orders/${o._id}`} className="font-mono text-xs font-semibold text-teal hover:underline">
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-white/80">
                    <span className="font-medium">{o.user?.name || "Customer"}</span>
                    {o.user?.customerId && (
                      <p className="font-mono text-[11px] text-accent">{o.user.customerId}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-white/50 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-NP")}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-white">
                    {formatNPR(o.totalPrice)}
                  </td>
                  <td className="px-5 py-3.5">
                    <PriceTag tone={o.isPaid ? "teal" : "muted"}>
                      {o.isPaid ? "Paid" : "COD / Pending"}
                    </PriceTag>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={o.status}
                      disabled={updatingId === o._id}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className="rounded-xl border border-white/15 bg-inkdark px-3 py-1.5 text-xs text-white outline-none focus:border-teal"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminOrders;
