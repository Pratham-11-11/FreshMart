import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { motion } from "framer-motion";
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight } from "lucide-react";

export default function Cart() {
  const { cart, user, setQty, removeFromCart, cartTotal } = useApp();
  const nav = useNavigate();

  if (!user) return (
    <div className="max-w-2xl mx-auto p-10 text-center">
      <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground" />
      <h2 className="font-heading text-2xl font-bold mt-4">Please sign in to view your cart</h2>
      <Link to="/login" className="mt-4 inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold">Sign In</Link>
    </div>
  );

  const items = cart.items.map(i => ({ ...i, p: cart.products.find(x => x.id === i.product_id) })).filter(i => i.p);
  const delivery = cartTotal >= 199 || cartTotal === 0 ? 0 : 29;

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto p-10 text-center">
      <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground" />
      <h2 className="font-heading text-2xl font-bold mt-4">Your cart is empty</h2>
      <p className="text-muted-foreground">Add some fresh essentials to get started.</p>
      <Link to="/home" className="mt-4 inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold" data-testid="continue-shopping">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold" data-testid="cart-heading">Your Cart <span className="text-muted-foreground text-lg font-medium">({items.length})</span></h1>
      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((i) => (
            <motion.div key={i.product_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-4 rounded-3xl bg-card border card-shadow" data-testid={`cart-item-${i.product_id}`}>
              <Link to={`/product/${i.p.id}`} className="w-20 h-20 rounded-2xl overflow-hidden bg-muted shrink-0">
                <img src={i.p.image} alt="" className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${i.p.id}`} className="font-heading font-semibold line-clamp-1 hover:text-primary">{i.p.name}</Link>
                <div className="text-xs text-muted-foreground">{i.p.brand} · {i.p.weight}</div>
                <div className="font-heading font-bold mt-1">₹{i.p.price} <span className="text-xs text-muted-foreground line-through font-normal">₹{i.p.mrp}</span></div>
              </div>
              <div className="flex items-center rounded-full border overflow-hidden text-sm">
                <button onClick={() => setQty(i.product_id, i.qty - 1)} className="px-3 py-1.5 hover:bg-muted" data-testid={`dec-${i.product_id}`}><Minus className="w-3 h-3" /></button>
                <div className="px-3 min-w-[36px] text-center font-semibold">{i.qty}</div>
                <button onClick={() => setQty(i.product_id, i.qty + 1)} className="px-3 py-1.5 hover:bg-muted" data-testid={`inc-${i.product_id}`}><Plus className="w-3 h-3" /></button>
              </div>
              <button onClick={() => removeFromCart(i.product_id)} className="p-2 rounded-full hover:bg-destructive/10 text-destructive" data-testid={`remove-${i.product_id}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 sticky top-24">
            <h3 className="font-heading font-bold text-xl">Bill Details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={delivery === 0 ? "text-primary font-semibold" : ""}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span></div>
              {cartTotal < 199 && cartTotal > 0 && <div className="text-xs text-secondary">Add ₹{(199 - cartTotal).toFixed(2)} more for FREE delivery</div>}
              <div className="border-t pt-2 flex justify-between font-heading font-bold text-lg"><span>Total</span><span data-testid="cart-total">₹{(cartTotal + delivery).toFixed(2)}</span></div>
            </div>
            <button onClick={() => nav("/checkout")} className="mt-6 w-full py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-semibold flex items-center justify-center gap-2 hover:opacity-90" data-testid="checkout-btn">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
