import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Save, ShieldCheck } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    address: {
      fullName: user?.address?.fullName || user?.name || "",
      line1: user?.address?.line1 || "",
      line2: user?.address?.line2 || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "Nepal",
      phone: user?.address?.phone || user?.phone || "",
    },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAddressChange = (e) =>
    setForm({ ...form, address: { ...form.address, [e.target.name]: e.target.value } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      };
      if (form.password) payload.password = form.password;
      const { data } = await api.put("/users/profile", payload);
      setUser(data);
      setSuccess("Profile and address updated successfully.");
      setForm((f) => ({ ...f, password: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl px-4 py-8 sm:px-6"
    >
      <h1 className="font-display text-2xl font-bold text-ink">Account Profile & Address</h1>
      <p className="mt-1 text-sm text-ink/50">Manage your personal information, contact number, and default delivery address.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && <Message type="error">{error}</Message>}
        {success && <Message type="success">{success}</Message>}

        {/* User Identity Info */}
        <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-ink/8 pb-4 mb-4">
            <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <User className="h-4 w-4 text-teal" /> Personal Details
            </h2>
            {user?.customerId && (
              <span className="rounded-lg bg-teal/10 px-3 py-1 font-mono text-xs font-bold text-teal">
                ID: {user.customerId}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/70">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/70">Gmail Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Gmail"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/70">Nepali Mobile Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9841234567"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/70">New Password (Optional)</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep unchanged"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-teal" /> Default Delivery Address in Nepal
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="fullName"
              value={form.address.fullName}
              onChange={handleAddressChange}
              placeholder="Recipient Name"
              className="input"
            />
            <input
              name="phone"
              value={form.address.phone}
              onChange={handleAddressChange}
              placeholder="Contact Phone"
              className="input"
            />
            <input
              name="line1"
              value={form.address.line1}
              onChange={handleAddressChange}
              placeholder="Street / Tole / Ward No."
              className="input sm:col-span-2"
            />
            <input
              name="city"
              value={form.address.city}
              onChange={handleAddressChange}
              placeholder="City (e.g. Kathmandu)"
              className="input"
            />
            <input
              name="state"
              value={form.address.state}
              onChange={handleAddressChange}
              placeholder="Province / State"
              className="input"
            />
            <input
              name="postalCode"
              value={form.address.postalCode}
              onChange={handleAddressChange}
              placeholder="Postal Code"
              className="input"
            />
            <input
              name="country"
              value={form.address.country}
              onChange={handleAddressChange}
              placeholder="Country"
              className="input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 font-semibold text-white transition hover:bg-teal disabled:opacity-60 shadow-md"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Saving changes…" : "Save Profile Changes"}
        </button>
      </form>
    </motion.div>
  );
};

export default Profile;
