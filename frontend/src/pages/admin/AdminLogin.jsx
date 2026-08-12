import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Message from "../../components/Message.jsx";

const AdminLogin = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.isAdmin) navigate("/admin", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await login(email, password);
      if (data.isAdmin) {
        navigate("/admin");
      } else {
        setError("Access denied. This account does not have administrative privileges.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid administrator credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-inkdark px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink p-8 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <Link to="/" className="font-display text-2xl font-bold text-white">
            Buy<span className="text-accent">Smart</span>
          </Link>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/40">
            Administrative Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Message type="error">{error}</Message>}

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@buysmart.com"
                className="input bg-inkdark pl-9 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input bg-inkdark pl-9 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-inkdark transition hover:bg-accentdark disabled:opacity-60"
          >
            {submitting ? "Authenticating…" : "Sign In to Admin Panel"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          <Link to="/" className="text-teal hover:underline">
            ← Return to Storefront
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
