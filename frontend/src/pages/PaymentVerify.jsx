import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import api from "../api/axios.js";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gateway = searchParams.get("gateway");
  const orderId = searchParams.get("orderId");
  const esewaData = searchParams.get("data");
  const khaltiPidx = searchParams.get("pidx");
  const isFailed = searchParams.get("failed") === "true";

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [message, setMessage] = useState("Verifying your payment with the payment gateway…");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      setMessage("Missing order information.");
      return;
    }

    if (isFailed) {
      setStatus("error");
      setMessage("Payment was cancelled or failed on the gateway.");
      return;
    }

    const verify = async () => {
      try {
        if (gateway === "esewa") {
          if (!esewaData) {
            throw new Error("Missing transaction response from eSewa");
          }
          await api.post(`/orders/${orderId}/pay/esewa-verify`, { encodedData: esewaData });
        } else if (gateway === "khalti") {
          if (!khaltiPidx) {
            throw new Error("Missing Khalti payment index (pidx)");
          }
          await api.post(`/orders/${orderId}/pay/khalti-verify`, { pidx: khaltiPidx });
        } else {
          throw new Error("Unsupported payment gateway");
        }

        setStatus("success");
        setMessage("Payment verified successfully! Your order has been marked as PAID.");

        // Automatically navigate to order details after 2.5 seconds
        setTimeout(() => {
          navigate(`/orders/${orderId}`);
        }, 2500);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || err.message || "Failed to verify payment transaction");
      }
    };

    verify();
  }, [gateway, orderId, esewaData, khaltiPidx, isFailed, navigate]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-ink/8 bg-white p-8 text-center shadow-xl shadow-ink/5"
      >
        {status === "verifying" && (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">Verifying Payment</h1>
            <p className="mt-2 text-sm text-ink/60">{message}</p>
            <p className="mt-4 text-xs text-ink/40">Please do not close or refresh this tab.</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">Payment Confirmed!</h1>
            <p className="mt-2 text-sm text-ink/70">{message}</p>
            <div className="mt-6">
              <Link
                to={`/orders/${orderId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 font-semibold text-white transition hover:bg-teal"
              >
                Go to Order Details <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="h-9 w-9 text-rose-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink">Verification Failed</h1>
            <p className="mt-2 text-sm text-rose-700 bg-rose-50/50 p-3 rounded-lg border border-rose-100">
              {message}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                to={`/orders/${orderId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 font-semibold text-white transition hover:bg-teal"
              >
                Return to Order
              </Link>
              <Link
                to="/orders"
                className="text-xs text-ink/50 hover:text-ink mt-2"
              >
                View all my orders
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentVerify;
