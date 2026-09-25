import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, QrCode, ExternalLink, Loader2, Smartphone } from "lucide-react";
import api from "../api/axios.js";
import { formatNPR } from "../utils/currency.js";
import Message from "./Message.jsx";

const PaymentModal = ({ order, initialGateway = "eSewa", isOpen, onClose, onPaymentSuccess }) => {
  const [gateway, setGateway] = useState(initialGateway);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fonepayData, setFonepayData] = useState(null);
  const [khaltiData, setKhaltiData] = useState(null);
  const [esewaData, setEsewaData] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min countdown for QR

  useEffect(() => {
    if (initialGateway) setGateway(initialGateway);
  }, [initialGateway]);

  // Load gateway details when modal opens or gateway changes
  useEffect(() => {
    if (!isOpen || !order || order.isPaid) return;

    setError("");
    setLoading(true);

    if (gateway === "eSewa") {
      api
        .post(`/orders/${order._id}/pay/esewa-initiate`)
        .then(({ data }) => setEsewaData(data))
        .catch((err) => setError(err.response?.data?.message || "Failed to prepare eSewa payment"))
        .finally(() => setLoading(false));
    } else if (gateway === "Khalti") {
      api
        .post(`/orders/${order._id}/pay/khalti-initiate`)
        .then(({ data }) => setKhaltiData(data))
        .catch((err) => setError(err.response?.data?.message || "Failed to prepare Khalti payment"))
        .finally(() => setLoading(false));
    } else if (gateway === "FonePay") {
      api
        .post(`/orders/${order._id}/pay/fonepay-initiate`)
        .then(({ data }) => {
          setFonepayData(data);
          setTimerSeconds(300);
        })
        .catch((err) => setError(err.response?.data?.message || "Failed to prepare FonePay QR"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, order, gateway]);

  // Countdown timer for FonePay QR
  useEffect(() => {
    if (!isOpen || gateway !== "FonePay") return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, gateway]);

  if (!isOpen || !order) return null;

  // Handle direct eSewa form submission to official gateway
  const handleEsewaSubmit = () => {
    if (!esewaData) return;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = esewaData.url;

    Object.entries(esewaData.params).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // Handle simulation verification for test mode
  const handleSimulateEsewa = async () => {
    setLoading(true);
    setError("");
    try {
      // Simulate base64 encoded response matching eSewa signature
      const mockPayload = {
        transaction_code: `ESEWA-${Date.now()}`,
        status: "COMPLETE",
        total_amount: order.totalPrice.toFixed(2),
        transaction_uuid: esewaData?.params?.transaction_uuid || `${order._id}-${Date.now()}`,
        product_code: esewaData?.params?.product_code || "EPAYTEST",
        signature: esewaData?.params?.signature || "mock_sig",
      };
      const encoded = btoa(JSON.stringify(mockPayload));
      const { data } = await api.post(`/orders/${order._id}/pay/esewa-verify`, {
        encodedData: encoded,
      });
      onPaymentSuccess(data.order);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Simulated payment failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle Khalti redirect or test verification
  const handleKhaltiPay = async () => {
    if (khaltiData?.paymentUrl && khaltiData?.mode === "live") {
      window.location.href = khaltiData.paymentUrl;
      return;
    }

    setLoading(true);
    setError("");
    try {
      const pidx = khaltiData?.pidx || `KHALTI-SANDBOX-${order._id}-${Date.now()}`;
      const { data } = await api.post(`/orders/${order._id}/pay/khalti-verify`, { pidx });
      onPaymentSuccess(data.order);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalti verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle FonePay payment verification
  const handleFonepayVerify = async () => {
    if (!fonepayData?.traceId) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(`/orders/${order._id}/pay/fonepay-verify`, {
        traceId: fonepayData.traceId,
      });
      onPaymentSuccess(data.order);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "FonePay verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-ink/8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-teal" />
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Nepal Payment Checkout</h3>
                <p className="text-xs text-ink/50">Order #{order.orderNumber || order._id.slice(-6)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Gateway Selector Tabs */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { id: "eSewa", label: "eSewa", color: "emerald", icon: "🟢" },
              { id: "Khalti", label: "Khalti", color: "purple", icon: "🟣" },
              { id: "FonePay", label: "FonePay QR", color: "rose", icon: "🔴" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGateway(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition border-2 ${
                  gateway === tab.id
                    ? tab.id === "eSewa"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : tab.id === "Khalti"
                      ? "border-purple-600 bg-purple-50 text-purple-800"
                      : "border-rose-600 bg-rose-50 text-rose-800"
                    : "border-ink/8 bg-neutral-50 text-ink/70 hover:bg-neutral-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Total Amount Banner */}
          <div className="mt-4 rounded-xl bg-neutral-50 p-3.5 flex items-center justify-between border border-ink/5">
            <span className="text-xs font-medium text-ink/60">Payable Total (NPR):</span>
            <span className="font-mono text-xl font-bold text-teal">{formatNPR(order.totalPrice)}</span>
          </div>

          {error && (
            <div className="mt-3">
              <Message type="error">{error}</Message>
            </div>
          )}

          {/* Gateway-specific Content */}
          <div className="mt-4 min-h-[220px] flex flex-col justify-center">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-ink/50 text-sm">
                <Loader2 className="h-8 w-8 animate-spin text-teal mb-2" />
                <span>Preparing {gateway} payment…</span>
              </div>
            ) : gateway === "eSewa" ? (
              /* eSewa Gateway Panel */
              <div className="text-center py-2 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <span className="text-2xl font-bold">e</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink">eSewa ePay v2 Checkout</h4>
                  <p className="text-xs text-ink/60 mt-1 max-w-sm mx-auto">
                    Complete your payment using your eSewa ID and MPIN via eSewa secure payment gateway.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleEsewaSubmit}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                  >
                    Pay {formatNPR(order.totalPrice)} with eSewa <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateEsewa}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-medium py-1"
                  >
                    ⚡ One-Click Sandbox Simulation (Test Mode)
                  </button>
                </div>
              </div>
            ) : gateway === "Khalti" ? (
              /* Khalti Gateway Panel */
              <div className="text-center py-2 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                  <span className="text-2xl font-bold">K</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink">Khalti Digital Wallet</h4>
                  <p className="text-xs text-ink/60 mt-1 max-w-sm mx-auto">
                    Pay securely using Khalti mobile balance, e-Banking, or Khalti Mobile App.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleKhaltiPay}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-700 py-3 font-semibold text-white transition hover:bg-purple-800 shadow-md shadow-purple-700/20"
                  >
                    Pay {formatNPR(order.totalPrice)} via Khalti <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleKhaltiPay}
                    className="text-xs text-purple-700 hover:text-purple-900 font-medium py-1"
                  >
                    ⚡ One-Click Sandbox Simulation (Test Mode)
                  </button>
                </div>
              </div>
            ) : (
              /* FonePay QR Panel */
              <div className="text-center py-1">
                <div className="inline-block rounded-xl border-2 border-rose-500/20 bg-rose-50/50 p-4 shadow-inner">
                  {/* Dynamic QR SVG Pattern */}
                  <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-lg bg-white p-2 shadow-sm border border-neutral-200">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      {/* Stylized QR Position markers */}
                      <rect x="5" y="5" width="28" height="28" rx="4" fill="#e11d48" />
                      <rect x="9" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                      <rect x="13" y="13" width="12" height="12" rx="1" fill="#e11d48" />

                      <rect x="67" y="5" width="28" height="28" rx="4" fill="#e11d48" />
                      <rect x="71" y="9" width="20" height="20" rx="2" fill="#ffffff" />
                      <rect x="75" y="13" width="12" height="12" rx="1" fill="#e11d48" />

                      <rect x="5" y="67" width="28" height="28" rx="4" fill="#e11d48" />
                      <rect x="9" y="71" width="20" height="20" rx="2" fill="#ffffff" />
                      <rect x="13" y="75" width="12" height="12" rx="1" fill="#e11d48" />

                      {/* Data dots pattern */}
                      <rect x="38" y="8" width="6" height="6" fill="#1f2937" />
                      <rect x="50" y="8" width="6" height="6" fill="#1f2937" />
                      <rect x="42" y="20" width="6" height="6" fill="#1f2937" />
                      <rect x="54" y="20" width="6" height="6" fill="#1f2937" />

                      <rect x="8" y="38" width="6" height="6" fill="#1f2937" />
                      <rect x="20" y="42" width="6" height="6" fill="#1f2937" />
                      <rect x="8" y="50" width="6" height="6" fill="#1f2937" />
                      <rect x="20" y="54" width="6" height="6" fill="#1f2937" />

                      <rect x="72" y="38" width="6" height="6" fill="#1f2937" />
                      <rect x="84" y="42" width="6" height="6" fill="#1f2937" />
                      <rect x="72" y="50" width="6" height="6" fill="#1f2937" />
                      <rect x="84" y="54" width="6" height="6" fill="#1f2937" />

                      <rect x="38" y="72" width="6" height="6" fill="#1f2937" />
                      <rect x="50" y="72" width="6" height="6" fill="#1f2937" />
                      <rect x="42" y="84" width="6" height="6" fill="#1f2937" />
                      <rect x="54" y="84" width="6" height="6" fill="#1f2937" />
                      <rect x="72" y="72" width="6" height="6" fill="#1f2937" />
                      <rect x="84" y="84" width="6" height="6" fill="#1f2937" />

                      {/* Center Brand Badge */}
                      <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#e11d48" strokeWidth="2" />
                      <text
                        x="50"
                        y="54"
                        textAnchor="middle"
                        fill="#e11d48"
                        fontSize="9"
                        fontWeight="900"
                        fontFamily="sans-serif"
                      >
                        FP
                      </text>
                    </svg>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-rose-800">
                    FonePay Merchant: {fonepayData?.merchantName || "BuySmart Store Nepal"}
                  </div>
                  <div className="text-[11px] font-mono text-ink/50">
                    Trace ID: {fonepayData?.traceId}
                  </div>
                </div>

                <div className="mt-2 text-xs text-ink/50 flex items-center justify-center gap-1">
                  <span>QR expires in:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, "0")}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleFonepayVerify}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 font-semibold text-white transition hover:bg-rose-700 shadow-md shadow-rose-600/20"
                  >
                    <Smartphone className="h-4 w-4" /> Simulate Bank App Scan & Pay (Test Mode)
                  </button>
                  <p className="text-[11px] text-ink/40">
                    Scan with NIC Asia, Nabil, Global IME, Sanima, or any Nepali mobile banking app.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;
