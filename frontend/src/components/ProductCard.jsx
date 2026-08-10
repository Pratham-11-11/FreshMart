import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Plus, Heart, Clock } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function ProductCard({ p, index = 0 }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const inWish = wishlist.includes(p.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.04 }}
      whileHover={{ y: -6 }}
      className="group rounded-3xl bg-card border card-shadow overflow-hidden flex flex-col"
      data-testid={`product-card-${p.id}`}
    >
      <Link to={`/product/${p.id}`} className="relative block aspect-square overflow-hidden bg-muted">
        <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {p.discount > 0 && (
          <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {p.discount}% OFF
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform"
          data-testid={`wishlist-btn-${p.id}`}
        >
          <Heart className={`w-4 h-4 ${inWish ? "fill-secondary text-secondary" : "text-foreground"}`} />
        </button>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <Clock className="w-3 h-3" /> {p.delivery_min} min
        </div>
        <Link to={`/product/${p.id}`} className="font-heading font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors">{p.name}</Link>
        <div className="text-xs text-muted-foreground mt-0.5">{p.brand} · {p.weight}</div>
        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
            <Star className="w-3 h-3 fill-current" /> {p.rating}
          </div>
          <span className="text-xs text-muted-foreground">({p.reviews})</span>
        </div>
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            <div className="font-heading font-bold text-lg leading-none">₹{p.price}</div>
            {p.mrp > p.price && <div className="text-xs text-muted-foreground line-through mt-0.5">₹{p.mrp}</div>}
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => addToCart(p.id, 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
            data-testid={`add-to-cart-${p.id}`}
          >
            <Plus className="w-3.5 h-3.5" /> ADD
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
