import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, CreditCard, PackageCheck, CheckCircle2, QrCode, ExternalLink } from "lucide-react";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Message from "../components/Message.jsx";
import PriceTag from "../components/PriceTag.jsx";
import PaymentModal from "../components/PaymentModal.jsx";
import { formatNPR } from "../utils/currency.js";

const statusTone = {
  Processing: "muted",
  Shipped: "teal",
  Delivered: "accent",
  Cancelled: "muted",
};

const OrderDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const payNowParam = searchParams.get("payNow");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeGateway, setActiveGateway] = useState("eSewa");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => {
        setOrder(data);
        if (payNowParam && !data.isPaid) {
          const matchedGateway = ["eSewa", "Khalti", "FonePay"].includes(payNowParam)
            ? payNowParam
            : "eSewa";
          setActiveGateway(matchedGateway);
          setPaymentModalOpen(true);
        }
      })
      .catch((err) => setError(err.response?.data?.message || "Order not found"))
      .finally(() => setLoading(false));
  }, [id, payNowParam]);

  if (loading) return <Loader label="Loading order details" />;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Message type="error">{error}</Message>
      </div>
    );
  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl px-4 py-10 sm:px-6"
    >
      <Link to="/orders" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink/50 hover:text-teal">
        <ArrowLeft className="h-4 w-4" /> Back to My Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-ink/50">
            Placed on {new Date(order.createdAt).toLocaleString("en-NP")}
          </p>
        </div>
        <PriceTag tone={statusTone[order.status] || "muted"}>{order.status}</PriceTag>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {/* Order Items */}
          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-teal" /> Purchased Items
            </h2>
            <div className="mt-3 divide-y divide-ink/8">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-3">
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-ink/50">Quantity: {item.qty}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-ink">
                    {formatNPR(item.qty * item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal" /> Delivery Address
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              <span className="font-semibold text-ink">{order.shippingAddress.fullName}</span><br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country} · Phone: {order.shippingAddress.phone || "—"}
            </p>
          </div>
        </div>

        {/* Payment & Price Summary */}
        <div className="h-fit rounded-2xl border border-ink/8 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-teal" /> Payment Details
            </h2>
            <p className="mt-2 text-sm font-semibold text-ink">{order.paymentMethod}</p>

            {order.isPaid ? (
              <div className="mt-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Paid Successfully
                </div>
                <div>
                  <span className="text-emerald-600">Gateway:</span>{" "}
                  <strong>{order.paymentResult?.gateway || order.paymentMethod}</strong>
                </div>
                {order.paymentResult?.id && (
                  <div className="font-mono text-[11px] break-all">
                    <span className="text-emerald-600">Ref ID:</span> {order.paymentResult.id}
                  </div>
                )}
                <div className="text-[11px] text-emerald-600">
                  Paid on {new Date(order.paidAt).toLocaleString("en-NP")}
                </div>
              </div>
            ) : (
              <div className="mt-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <span className="font-bold">Payment Status:</span> Awaiting Payment
              </div>
            )}
          </div>

          {/* Payment action buttons if unpaid */}
          {!order.isPaid && (
            <div className="border-t border-ink/8 pt-3 space-y-2">
              <p className="text-xs font-semibold text-ink/70">Pay Now via Nepal Gateways:</p>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveGateway("eSewa");
                    setPaymentModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
                >
                  <span className="flex items-center gap-1.5">🟢 Pay with eSewa</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveGateway("Khalti");
                    setPaymentModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between rounded-xl bg-purple-700 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-purple-800 shadow-sm"
                >
                  <span className="flex items-center gap-1.5">🟣 Pay with Khalti</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveGateway("FonePay");
                    setPaymentModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 shadow-sm"
                >
                  <span className="flex items-center gap-1.5">🔴 Scan FonePay QR</span>
                  <QrCode className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 border-t border-ink/10 pt-3 text-sm text-ink/70">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-mono font-semibold">{formatNPR(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-mono font-semibold">
                {order.shippingPrice === 0 ? "Free" : formatNPR(order.shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (13%)</span>
              <span className="font-mono font-semibold">{formatNPR(order.taxPrice)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-bold text-ink">
              <span>Grand Total</span>
              <span className="font-mono text-teal">{formatNPR(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nepal Payment Modal */}
      <PaymentModal
        order={order}
        initialGateway={activeGateway}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={(updatedOrder) => {
          setOrder(updatedOrder);
        }}
      />
    </motion.div>
  );
};

export default OrderDetail;
