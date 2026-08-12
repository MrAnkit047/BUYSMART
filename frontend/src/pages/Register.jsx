import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, IdCard, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customUserId, setCustomUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Gmail Validation
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim())) {
      setError("Please enter a valid Gmail address ending with @gmail.com");
      return;
    }

    // 2. Nepali Phone Number Validation
    const cleanPhone = phone.trim();
    if (!/^(?:\+977[- ]?)?9[78]\d{8}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Nepali mobile number (starting with 98 or 97, e.g., 9841234567)");
      return;
    }

    // 3. Password Match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, cleanPhone, password, customUserId);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-ink/8 bg-white p-8 shadow-xl shadow-ink/5"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Create Your Account</h1>
          <p className="mt-1 text-sm text-ink/60">
            Join BuySmart to browse deals in NPR and manage your orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Message type="error">{error}</Message>}

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/70">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Shrestha"
                className="input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/70">Valid Gmail Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="input pl-9"
              />
            </div>
            <p className="mt-1 text-[11px] text-ink/40">Must end with @gmail.com</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/70">Nepali Mobile Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9841234567 or 9801234567"
                className="input pl-9"
              />
            </div>
            <p className="mt-1 text-[11px] text-ink/40">10-digit number starting with 98 or 97</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/70">
              Custom User / Customer ID <span className="font-normal text-ink/40">(Optional)</span>
            </label>
            <div className="relative">
              <IdCard className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
              <input
                value={customUserId}
                onChange={(e) => setCustomUserId(e.target.value)}
                placeholder="e.g. BS-USER-77 or ramesh_np"
                className="input pl-9"
              />
            </div>
            <p className="mt-1 text-[11px] text-ink/40">Leave blank to auto-generate a unique Customer ID</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/70">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/70">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="input pl-9"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 font-semibold text-white transition hover:bg-teal disabled:opacity-60"
          >
            {submitting ? "Registering account…" : "Register Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link
            to={`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
            className="font-semibold text-teal hover:underline"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
