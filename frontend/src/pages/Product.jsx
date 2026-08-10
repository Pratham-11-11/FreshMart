import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useApp } from "@/lib/AppContext";
import { Star, Heart, ShoppingCart, Zap, Truck, Shield, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Product() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/products/${id}`);
      setData(data);
      setQty(1);
      window.scrollTo(0, 0);
    })();
  }, [id]);

  if (!data) return <div className="max-w-7xl mx-auto p-8 animate-pulse">Loading…</div>;
  const p = data.product;
  const inWish = wishlist.includes(p.id);

  const buyNow = async () => {
    const ok = await addToCart(p.id, qty);
    if (ok) nav("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 md:gap-14">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24 h-fit">
          <div className="aspect-square rounded-3xl overflow-hidden bg-muted card-shadow relative">
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" data-testid="product-image" />
            {p.discount > 0 && <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-sm font-bold px-3 py-1.5 rounded-full">{p.discount}% OFF</span>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="text-xs uppercase tracking-widest text-primary font-bold">{p.brand}</div>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold mt-1 leading-tight" data-testid="product-name">{p.name}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold"><Star className="w-3.5 h-3.5 fill-current" /> {p.rating}</div>
            <span className="text-muted-foreground">{p.reviews} reviews</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{p.weight}</span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-heading text-4xl font-extrabold">₹{p.price}</span>
            {p.mrp > p.price && <span className="text-muted-foreground line-through text-lg">₹{p.mrp}</span>}
            {p.discount > 0 && <span className="text-primary font-semibold text-lg">{p.discount}% off</span>}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[{ i: Truck, t: `${p.delivery_min}m delivery` }, { i: Shield, t: "100% Fresh" }, { i: Award, t: "Quality Assured" }].map((x, i) => (
              <div key={i} className="glass rounded-2xl p-3 text-center">
                <x.i className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="text-xs font-medium">{x.t}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-full border overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-muted" data-testid="qty-minus">−</button>
              <div className="px-4 py-2 min-w-[40px] text-center font-semibold" data-testid="qty">{qty}</div>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:bg-muted" data-testid="qty-plus">+</button>
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => addToCart(p.id, qty)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-semibold hover:opacity-90" data-testid="add-to-cart-btn">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={buyNow} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-secondary text-secondary-foreground font-heading font-semibold hover:opacity-90" data-testid="buy-now-btn">
              <Zap className="w-4 h-4" /> Buy Now
            </motion.button>
            <button onClick={() => toggleWishlist(p.id)} className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-muted" data-testid="wishlist-detail-btn">
              <Heart className={`w-5 h-5 ${inWish ? "fill-secondary text-secondary" : ""}`} />
            </button>
          </div>

          <div className="mt-10">
            <h3 className="font-heading font-bold text-xl">Description</h3>
            <p className="text-muted-foreground mt-2 leading-relaxed">{p.description}</p>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="font-heading font-bold text-xl">Ratings & Reviews</h3>
            <div className="mt-3 flex items-center gap-4">
              <div className="font-heading text-4xl font-extrabold">{p.rating}</div>
              <div>
                <div className="flex items-center text-secondary">{[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(p.rating) ? "fill-current" : ""}`} />)}</div>
                <div className="text-xs text-muted-foreground">Based on {p.reviews} reviews</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {data.similar?.length > 0 && (
        <div className="mt-16">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold flex items-center gap-2">Similar Products <ChevronRight className="w-6 h-6" /></h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {data.similar.map((sp, i) => <ProductCard key={sp.id} p={sp} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
