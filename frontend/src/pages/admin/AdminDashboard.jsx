import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingBag, Clock, DollarSign, ArrowUpRight } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { formatNPR } from "../../utils/currency.js";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: productsData }, { data: orders }] = await Promise.all([
          api.get("/products", { params: { limit: 1 } }),
          api.get("/orders"),
        ]);
        const revenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
        const pending = orders.filter((o) => o.status === "Processing").length;
        setStats({
          totalProducts: productsData.total || productsData.products?.length || 0,
          totalOrders: orders.length,
          revenue,
          pending,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading administrative statistics" />;

  const cards = [
    { label: "Total Catalog Products", value: stats.totalProducts, icon: Package, link: "/admin/products" },
    { label: "Total Customer Orders", value: stats.totalOrders, icon: ShoppingBag, link: "/admin/orders" },
    { label: "Orders Pending Dispatch", value: stats.pending, icon: Clock, link: "/admin/orders" },
    { label: "Gross Sales Volume", value: formatNPR(stats.revenue), icon: DollarSign, link: "/admin/orders" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Overview Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">Manage store performance, product catalog, pricing, and orders.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.link}
              className="group rounded-2xl border border-white/10 bg-ink p-5 transition hover:border-accent hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/50">{c.label}</span>
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-white">{c.value}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-teal font-medium group-hover:underline">
                View section <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/products/new"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-inkdark transition hover:bg-accentdark shadow-md"
        >
          + Add New Product
        </Link>
        <Link
          to="/admin/products"
          className="rounded-xl border border-white/20 bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:border-teal hover:text-teal"
        >
          Manage All Products
        </Link>
        <Link
          to="/admin/orders"
          className="rounded-xl border border-white/20 bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:border-teal hover:text-teal"
        >
          Manage Orders
        </Link>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
