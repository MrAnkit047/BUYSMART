import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("request"); // "request" | "reset" | "success"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      const data = await forgotPassword(email);
      setSuccessMsg(data.message || "A 6-digit password reset code has been sent to your Gmail.");
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code. Please check your Gmail.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const data = await resetPassword(email, cleanCode, newPassword);
      setSuccessMsg(data.message || "Password reset successful!");
      setStep("success");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired reset code");
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
        <AnimatePresence mode="wait">
          {step === "request" && (
            <motion.div
              key="step-request"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-bold text-ink">Forgot Password?</h1>
                <p className="mt-1 text-sm text-ink/50">
                  Enter your registered Gmail ID to receive a 6-digit reset code.
                </p>
              </div>

              {error && (
                <div className="mb-4">
                  <Message type="error">{error}</Message>
                </div>
              )}

              <form onSubmit={handleRequestCode} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-ink py-3 font-semibold text-white transition hover:bg-teal disabled:opacity-60"
                >
                  {submitting ? "Sending verification code…" : "Send Reset Code"}
                </button>
              </form>

              <div className="mt-6 border-t border-ink/8 pt-5 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to Log In
                </Link>
              </div>
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div
              key="step-reset"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-bold text-ink">Reset Your Password</h1>
                <p className="mt-1 text-xs text-ink/60">
                  Enter the 6-digit code sent to <span className="font-semibold text-ink">{email}</span> and your new password.
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

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="mb-1 block text-center text-xs font-semibold text-ink/70">
                    6-Digit Verification Code
                  </label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="input text-center text-2xl tracking-[0.35em] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink/70">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
                    <input
                      required
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink/70">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
                    <input
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      className="input pl-9"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  className="w-full rounded-xl bg-ink py-3 font-semibold text-white transition hover:bg-teal disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? "Updating Password…" : "Update Password"}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center border-t border-ink/8 pt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setCode("");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-ink/50 hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Re-enter Gmail
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                <CheckCircle2 className="h-9 w-9 text-teal" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink">Password Updated!</h2>
              <p className="mt-2 text-sm text-ink/60">
                Your password has been successfully reset. You can now log in using your new credentials.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 w-full rounded-xl bg-ink py-3 font-semibold text-white transition hover:bg-teal"
              >
                Log In Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
