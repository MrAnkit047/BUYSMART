import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-ink/8 bg-white p-8 shadow-xl shadow-ink/5"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink/5 text-ink">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Welcome Back</h1>
          <p className="mt-1 text-sm text-ink/50">Log in to access your BuySmart account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Message type="error">{error}</Message>}

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/70">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/70">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-ink py-3 font-semibold text-white transition hover:bg-teal disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          New to BuySmart?{" "}
          <Link
            to={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
            className="font-semibold text-teal hover:underline"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
