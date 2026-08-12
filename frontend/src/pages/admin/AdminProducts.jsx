import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Message from "../../components/Message.jsx";
import { formatNPR } from "../../utils/currency.js";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone."))
      return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader label="Loading products catalog" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Manage Product Catalog</h1>
          <p className="text-xs text-white/50">Full administrative control over pricing (NPR), stock, and product info.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-inkdark transition hover:bg-accentdark shadow-md"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {error && <Message type="error">{error}</Message>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-inkdark font-mono text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-5 py-3.5">Product Info</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Price (NPR)</th>
              <th className="px-5 py-3.5">Stock</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-white/40">
                  No products in catalog yet. Click "+ Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-white/5 transition">
                  <td className="flex items-center gap-3.5 px-5 py-3.5">
                    <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <span className="font-semibold text-white">{p.name}</span>
                      <p className="text-xs text-white/40">Brand: {p.brand}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/70">{p.category}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-accent">
                    {formatNPR(p.discountPrice || p.price)}
                    {p.discountPrice && p.discountPrice < p.price && (
                      <span className="ml-1.5 text-xs text-white/40 line-through font-normal">
                        {formatNPR(p.price)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`font-semibold ${
                        p.countInStock === 0 ? "text-red-400" : "text-teal"
                      }`}
                    >
                      {p.countInStock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/products/${p._id}/edit`}
                        className="flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id}
                        className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:underline disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === p._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
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

export default AdminProducts;
