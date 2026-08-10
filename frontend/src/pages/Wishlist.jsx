import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { wishlist } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.get("/products");
      setItems(data.filter(p => wishlist.includes(p.id)));
      setLoading(false);
    })();
  }, [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold flex items-center gap-2" data-testid="wishlist-heading">
        <Heart className="w-8 h-8 text-secondary fill-current" /> Wishlist
      </h1>
      {items.length === 0 && !loading ? (
        <div className="mt-10 text-center text-muted-foreground">
          No favourites yet. <Link to="/home" className="text-primary underline">Start browsing</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {items.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
