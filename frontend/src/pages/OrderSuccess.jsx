import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/orders", { replace: true });
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);

        setOrder(response.data);
      } catch (error) {
        console.error("Order success error:", error);

        toast.error(
          error?.response?.data?.detail || "Unable to load order details.",
        );

        navigate("/orders", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />

          <p className="mt-4 text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success header */}
        <div className="text-center">
          <motion.div
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 12,
            }}
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-14 h-14 text-primary" />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
          >
            <span className="block mt-6 text-xs font-bold tracking-widest text-primary">
              FRESHMART
            </span>

            <h1
              className="mt-2 text-3xl md:text-4xl font-extrabold"
              data-testid="order-success-heading"
            >
              Order Confirmed!
            </h1>

            <p className="mt-3 text-muted-foreground">
              Your fresh groceries are on their way 🎉
            </p>
          </motion.div>
        </div>

        {/* Main card */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="mt-10 rounded-3xl bg-card border card-shadow p-6 md:p-8"
        >
          {/* Order ID */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Order ID</span>

            <span className="font-mono font-semibold">
              {String(order.id).slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* ETA */}
          <div className="mt-5 flex items-center gap-3 p-4 rounded-2xl bg-primary/10 text-primary">
            <Clock className="w-6 h-6 flex-shrink-0" />

            <div>
              <div className="font-heading font-bold">
                Arriving in ~{order.eta_minutes || 30} minutes
              </div>

              <div className="text-xs opacity-80 mt-1">
                Your groceries are being prepared.
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-5 flex items-center gap-3 p-4 rounded-2xl bg-muted">
            <Package className="w-5 h-5 text-primary" />

            <div>
              <div className="text-xs text-muted-foreground">Order Status</div>

              <div className="font-bold capitalize">
                {order.status || "Pending"}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="mt-8">
            <h2 className="font-heading font-bold text-lg">Your Items</h2>

            <div className="mt-4 space-y-4">
              {(order.items || []).map((item) => (
                <div key={item.product_id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name || "Product"}
                    className="w-14 h-14 rounded-xl object-cover bg-muted"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {item.name}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      Qty: {item.qty}
                    </div>
                  </div>

                  <div className="font-heading font-bold">
                    ₹
                    {(Number(item.price || 0) * Number(item.qty || 0)).toFixed(
                      2,
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mt-8 pt-6 border-t text-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>

              <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
            </div>

            {Number(order.discount || 0) > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount</span>

                <span>
                  −₹
                  {Number(order.discount).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>

              <span>
                {Number(order.delivery_fee || 0) === 0
                  ? "FREE"
                  : `₹${Number(order.delivery_fee).toFixed(2)}`}
              </span>
            </div>

            <div className="pt-4 border-t flex justify-between font-heading font-bold text-xl">
              <span>Total</span>

              <span>₹{Number(order.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="mt-6 p-4 rounded-2xl bg-muted">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />

                <div>
                  <div className="font-semibold">Delivery Address</div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {order.address.name && (
                      <>
                        {order.address.name}
                        <br />
                      </>
                    )}

                    {order.address.line1}

                    {order.address.city && <>, {order.address.city}</>}

                    {order.address.pincode && <> - {order.address.pincode}</>}

                    {order.address.phone && (
                      <>
                        <br />
                        Phone: {order.address.phone}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          {order.payment_method && (
            <div className="mt-4 text-sm text-muted-foreground">
              Payment:{" "}
              <strong className="text-foreground">
                {order.payment_method === "COD"
                  ? "Cash on Delivery"
                  : order.payment_method}
              </strong>
            </div>
          )}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
          }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/orders"
            className="px-6 py-3 rounded-full border font-semibold hover:bg-muted transition flex items-center justify-center gap-2"
            data-testid="view-orders-btn"
          >
            <Package className="w-4 h-4" />
            My Orders
          </Link>

          <Link
            to="/home"
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Keep Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Thank you for shopping with FreshMart 🌱
        </p>
      </div>
    </div>
  );
}
