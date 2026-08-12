import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, PackagePlus, Upload } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Message from "../../components/Message.jsx";

const emptyProduct = {
  name: "",
  description: "",
  brand: "",
  category: "",
  image: "",
  price: "",
  discountPrice: "",
  countInStock: "",
  isFeatured: false,
};

const AdminProductEdit = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image: data.image }));
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then(({ data }) =>
        setForm({
          name: data.name,
          description: data.description,
          brand: data.brand,
          category: data.category,
          image: data.image,
          price: data.price,
          discountPrice: data.discountPrice || "",
          countInStock: data.countInStock,
          isFeatured: data.isFeatured,
        })
      )
      .catch((err) => setError(err.response?.data?.message || "Could not load product"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        countInStock: Number(form.countInStock),
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading product editor" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl px-4 py-8 sm:px-6"
    >
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-accent">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Products List
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <PackagePlus className="h-6 w-6 text-accent" />
        <h1 className="font-display text-2xl font-bold text-white">
          {isEdit ? "Edit Product & Price" : "Add New Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink p-6 shadow-xl">
        {error && <Message type="error">{error}</Message>}

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">Product Name *</label>
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Samsung Galaxy A15"
            className="input bg-inkdark text-white placeholder:text-white/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">Description *</label>
          <textarea
            required
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Provide key features and specifications..."
            className="input bg-inkdark text-white placeholder:text-white/30"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">Brand *</label>
            <input
              required
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g. Samsung, HP, Nike"
              className="input bg-inkdark text-white placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">Category *</label>
            <input
              required
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Electronics, Fashion, Home..."
              className="input bg-inkdark text-white placeholder:text-white/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">Image Asset URL / Upload *</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              required
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://... or choose file to upload"
              className="input flex-1 bg-inkdark text-white placeholder:text-white/30"
            />
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-inkdark px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition shrink-0">
              <Upload className="h-4 w-4 text-accent" />
              {uploading ? "Uploading..." : "Upload Image"}
              <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">Regular Price (NPR) *</label>
            <input
              required
              type="number"
              step="1"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 26999"
              className="input bg-inkdark text-white placeholder:text-white/30 font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">Discount Price (NPR)</label>
            <input
              type="number"
              step="1"
              min="0"
              name="discountPrice"
              value={form.discountPrice}
              onChange={handleChange}
              placeholder="e.g. 24999 (Optional)"
              className="input bg-inkdark text-white placeholder:text-white/30 font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">Stock Quantity *</label>
            <input
              required
              type="number"
              min="0"
              name="countInStock"
              value={form.countInStock}
              onChange={handleChange}
              placeholder="e.g. 30"
              className="input bg-inkdark text-white placeholder:text-white/30 font-mono"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-white/80 pt-2 cursor-pointer">
          <input
            type="checkbox"
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            className="accent-accent"
          />
          Feature this product on homepage deals section
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-inkdark transition hover:bg-accentdark disabled:opacity-60 shadow-lg"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Saving Product…" : isEdit ? "Save Product Changes" : "Create Product"}
        </button>
      </form>
    </motion.div>
  );
};

export default AdminProductEdit;
