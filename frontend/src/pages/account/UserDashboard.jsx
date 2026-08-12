import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ShoppingBag, IdCard, Wallet, ChevronRight } from "lucide-react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatNPR } from "../../utils/currency.js";
import Loader from "../../components/Loader.jsx";

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/mine").then(({ data }) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const recent = orders.slice(0, 3);
  const totalSpent = orders.reduce((acc, o) => acc + o.totalPrice, 0);

  if (loading) return <Loader label="Loading your customer dashboard" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-sm text-ink/50">Manage your orders, profile settings, and shipping address.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-teal">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">User / Customer ID</span>
            <IdCard className="h-5 w-5" />
          </div>
          <p className="mt-3 font-mono text-lg font-bold text-ink">{user?.customerId || "—"}</p>
          <p className="mt-1 text-xs text-ink/40">Unique identification for order tracking</p>
        </div>

        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-teal">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="h-5 w-5" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">{orders.length}</p>
          <p className="mt-1 text-xs text-ink/40">Lifetime orders placed</p>
        </div>

        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-teal">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">Total Spent</span>
            <Wallet className="h-5 w-5" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">{formatNPR(totalSpent)}</p>
          <p className="mt-1 text-xs text-ink/40">In Nepalese Rupees (NPR)</p>
        </div>
      </div>

      {/* Recent Orders Card */}
      <div className="mt-8 rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent Orders</h2>
          <Link to="/account/orders" className="text-sm font-semibold text-teal hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-ink/50">You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="mt-3 inline-block rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink/8">
            {recent.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="flex items-center justify-between py-4 transition hover:bg-ink50/50 rounded-xl px-2"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-ink">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-ink/50">
                    {new Date(order.createdAt).toLocaleDateString("en-NP")} · Status: {order.status}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-ink">{formatNPR(order.totalPrice)}</span>
                  <ChevronRight className="h-4 w-4 text-ink/30" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserDashboard;
