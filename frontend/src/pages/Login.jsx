import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

const Login = () => {
  const { login, verifyLoginOtp, resendLoginOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      const data = await login(email, password);
      if (data.requireOtp) {
        setStep("otp");
        setSuccessMsg(data.message || "Verification code sent to your Gmail.");
        setResendCooldown(60);
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setSubmitting(true);
    try {
      await verifyLoginOtp(email, cleanCode);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired verification code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setSuccessMsg("");
    try {
      const res = await resendLoginOtp(email);
      setSuccessMsg(res.message || "A fresh verification code was sent to your Gmail.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
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
        <AnimatePresence mode="wait">
          {step === "credentials" ? (
            <motion.div
              key="credentials-step"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink/5 text-ink">
                  <LogIn className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-bold text-ink">Welcome Back</h1>
                <p className="mt-1 text-sm text-ink/50">Log in to access your BuySmart account.</p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {error && <Message type="error">{error}</Message>}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink/70">Gmail Address</label>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-ink/70">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-teal hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
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
                  {submitting ? "Checking credentials…" : "Continue to Verify"}
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
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-bold text-ink">Verify Gmail Code</h1>
                <p className="mt-1 text-xs text-ink/60">
                  We've sent a 6-digit login verification code to:
                  <br />
                  <span className="font-semibold text-ink">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4">
                  <Message type="error">{error}</Message>
                </div>
              )}
              {successMsg && (
                <div className="mb-4">
                  <Message type="info">{successMsg}</Message>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-center text-xs font-semibold text-ink/70">
                    Enter 6-Digit Code
                  </label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="input text-center text-2xl tracking-[0.35em] font-mono font-bold"
                  />
                  <p className="mt-1.5 text-center text-xs text-ink/40">
                    Code expires in 10 minutes
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || otpCode.length !== 6}
                  className="w-full rounded-xl bg-ink py-3 font-semibold text-white transition hover:bg-teal disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? "Verifying…" : "Verify & Sign In"}
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 border-t border-ink/8 pt-5 text-sm">
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 font-semibold text-teal hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend verification code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setOtpCode("");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to email & password
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
