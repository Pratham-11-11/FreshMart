import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  MapPin,
  Wallet,
  CircleCheck,
  Tag,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

export default function Checkout() {
  const { user, cart, cartTotal, refreshCart } = useApp();
  const navigate = useNavigate();

  const [addr, setAddr] = useState({
    name: user?.name || "",
    phone: "",
    line1: "",
    city: "",
    pincode: "",
  });

  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.name) {
      setAddr((previous) => ({
        ...previous,
        name: user.name,
      }));
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const cartItems = Array.isArray(cart?.items) ? cart.items : [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold">Your cart is empty</h1>

          <p className="mt-3 text-muted-foreground">
            Add some fresh groceries before proceeding to checkout.
          </p>

          <button
            onClick={() => navigate("/home")}
            className="mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90"
          >
            Shop now
          </button>
        </motion.div>
      </div>
    );
  }

  const discount =
    coupon.trim().toUpperCase() === "FRESH10"
      ? Math.round(cartTotal * 0.1 * 100) / 100
      : 0;

  const delivery = cartTotal >= 199 ? 0 : 29;

  const total = Math.max(0, cartTotal - discount + delivery);

  const updateAddress = (field, value) => {
    setAddr((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const placeOrder = async () => {
    if (
      !addr.name.trim() ||
      !addr.phone.trim() ||
      !addr.line1.trim() ||
      !addr.city.trim() ||
      !addr.pincode.trim()
    ) {
      toast.error("Please fill in all delivery address details.");
      return;
    }

    if (!/^\d{10}$/.test(addr.phone.trim())) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(addr.pincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/orders", {
        address: {
          name: addr.name.trim(),
          phone: addr.phone.trim(),
          line1: addr.line1.trim(),
          city: addr.city.trim(),
          pincode: addr.pincode.trim(),
        },
        payment_method: payment,
        coupon: coupon.trim() || null,
      });

      const order = response.data;

      toast.success("Order placed successfully!");

      await refreshCart();

      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error("Place order error:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to place order. Please try again.";

      toast.error(
        Array.isArray(message)
          ? message.map((item) => item.msg).join(", ")
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition";

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back */}
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </button>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="text-xs font-bold tracking-widest text-primary">
            FRESHMART CHECKOUT
          </span>

          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">
            Complete your order
          </h1>

          <p className="mt-2 text-muted-foreground">
            Enter your delivery details and choose your payment method.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Address */}
            <div className="p-6 rounded-3xl bg-card border card-shadow">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Delivery Address
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Where should we deliver your fresh groceries?
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className={inputClass}
                    value={addr.name}
                    onChange={(e) => updateAddress("name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={inputClass}
                    value={addr.phone}
                    onChange={(e) =>
                      updateAddress("phone", e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Address
                  </label>

                  <input
                    type="text"
                    placeholder="House no., street, area"
                    className={inputClass}
                    value={addr.line1}
                    onChange={(e) => updateAddress("line1", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>

                  <input
                    type="text"
                    placeholder="City"
                    className={inputClass}
                    value={addr.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={inputClass}
                    value={addr.pincode}
                    onChange={(e) =>
                      updateAddress(
                        "pincode",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="p-6 rounded-3xl bg-card border card-shadow">
              <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-secondary" />
                Apply Coupon
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <input
                  placeholder='Try "FRESH10" for 10% off'
                  className={inputClass}
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />

                {discount > 0 && (
                  <div className="px-4 py-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold whitespace-nowrap flex items-center justify-center gap-1">
                    <CircleCheck className="w-4 h-4" />
                    −₹{discount.toFixed(2)}
                  </div>
                )}
              </div>

              {coupon && discount === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Use <strong>FRESH10</strong> to get 10% off.
                </p>
              )}
            </div>

            {/* Payment */}
            <div className="p-6 rounded-3xl bg-card border card-shadow">
              <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Payment Method
              </h2>

              <div className="mt-4 space-y-3">
                {[
                  {
                    value: "COD",
                    label: "Cash on Delivery",
                    description: "Pay when your groceries arrive.",
                  },
                  {
                    value: "UPI",
                    label: "UPI",
                    description: "UPI payment simulation.",
                  },
                  {
                    value: "CARD",
                    label: "Credit / Debit Card",
                    description: "Card payment simulation.",
                  },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      payment === method.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={payment === method.value}
                        onChange={() => setPayment(method.value)}
                        className="mt-1 accent-primary"
                      />

                      <div>
                        <div className="font-semibold">{method.label}</div>

                        <div className="text-xs text-muted-foreground mt-1">
                          {method.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-3xl p-6 sticky top-24">
              <h2 className="font-heading font-bold text-xl">Order Summary</h2>

              {/* Items */}
              <div className="mt-5 space-y-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex gap-3">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.product?.name || "Product"}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.product?.name || "Product"}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Qty: {item.qty}
                      </div>
                    </div>

                    <div className="font-semibold text-sm">
                      ₹{((item.product?.price || 0) * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-5 pt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>

                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Coupon (FRESH10)</span>
                    <span>−₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>

                  <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
                </div>

                <div className="border-t pt-4 flex justify-between font-heading font-bold text-xl">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="mt-6 w-full py-4 rounded-full bg-primary text-primary-foreground font-heading font-semibold hover:opacity-90 disabled:opacity-60 transition"
              >
                {loading
                  ? "Placing Order..."
                  : `Place Order · ₹${total.toFixed(2)}`}
              </button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                🔒 Your order information is secure.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
