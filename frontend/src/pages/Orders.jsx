import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { Package, Clock, MapPin, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Orders() {
  const { user } = useApp();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      try {
        const response = await api.get("/orders");

        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Orders error:", error);

        toast.error(
          error?.response?.data?.detail || "Unable to load your orders.",
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground" />

          <h1 className="mt-5 text-3xl font-extrabold">
            Sign in to view your orders
          </h1>

          <p className="mt-2 text-muted-foreground">
            Your previous FreshMart orders will appear here.
          </p>

          <Link
            to="/login"
            className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />

          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>

            <span className="block text-xs font-bold tracking-widest text-primary">
              FRESHMART
            </span>

            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">
              My Orders
            </h1>

            <p className="mt-2 text-muted-foreground">
              Track and view your FreshMart orders.
            </p>
          </div>

          <Link
            to="/home"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Groceries
          </Link>
        </div>

        {/* Empty */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 md:p-16 rounded-3xl bg-card border card-shadow text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-10 h-10 text-primary" />
            </div>

            <h2 className="mt-6 text-2xl font-bold">No orders yet</h2>

            <p className="mt-2 text-muted-foreground">
              You haven't placed an order yet. Start shopping and discover
              something fresh.
            </p>

            <Link
              to="/home"
              className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, index) => {
              const status = order.status?.toLowerCase() || "pending";

              const statusClass =
                status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-primary/10 text-primary";

              return (
                <motion.div
                  key={order.id}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="p-5 md:p-6 rounded-3xl bg-card border card-shadow"
                >
                  {/* Order top */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />

                        <span className="font-bold">
                          Order #{String(order.id).slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.items?.length || 0} item
                        {(order.items?.length || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${statusClass}`}
                      >
                        {status}
                      </span>

                      <span className="font-heading font-bold text-lg">
                        ₹{Number(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                    {(order.items || []).slice(0, 4).map((item) => (
                      <div key={item.product_id} className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                          className="w-16 h-16 rounded-xl object-cover border"
                        />

                        <div className="mt-1 text-xs text-center max-w-16 truncate">
                          {item.name}
                        </div>

                        <div className="text-[11px] text-center text-muted-foreground">
                          ×{item.qty}
                        </div>
                      </div>
                    ))}

                    {(order.items?.length || 0) > 4 && (
                      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-sm font-semibold">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Delivery */}
                  {order.address && (
                    <div className="mt-4 pt-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 text-primary" />

                        <span>
                          Deliver to:{" "}
                          <strong className="text-foreground">
                            {order.address.line1}
                          </strong>
                          {order.address.city ? `, ${order.address.city}` : ""}
                          {order.address.pincode
                            ? ` - ${order.address.pincode}`
                            : ""}
                        </span>
                      </div>

                      {order.eta_minutes && (
                        <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                          <Clock className="w-4 h-4" />~{order.eta_minutes} min
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/order-success/${order.id}`}
                      className="flex-1 text-center px-5 py-3 rounded-full border font-semibold hover:bg-muted transition"
                    >
                      View Order
                    </Link>

                    <Link
                      to="/home"
                      className="flex-1 text-center px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                    >
                      Order Again
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
