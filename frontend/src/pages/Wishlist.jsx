import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";

export default function Wishlist() {
  const { wishlist, refreshWishlist } = useApp();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadWishlist = async () => {
      try {
        setLoading(true);

        const response = await api.get("/wishlist");

        if (mounted) {
          setItems(response.data?.products || []);
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);

        if (mounted) {
          setItems([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      mounted = false;
    };
  }, [wishlist]);

  const handleRefresh = async () => {
    try {
      await refreshWishlist?.();

      const response = await api.get("/wishlist");
      setItems(response.data?.products || []);
    } catch (error) {
      console.error("Failed to refresh wishlist:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1
          className="font-heading text-3xl md:text-4xl font-extrabold flex items-center gap-2"
          data-testid="wishlist-heading"
        >
          <Heart className="w-8 h-8 text-secondary fill-current" />
          Wishlist
        </h1>

        {!loading && items.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-12 flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />

          <p className="mt-3 text-muted-foreground">Loading your wishlist...</p>
        </div>
      )}

      {/* Empty wishlist */}
      {!loading && items.length === 0 && (
        <div className="mt-10 text-center py-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">Your wishlist is empty</h2>

          <p className="mt-2 text-muted-foreground">
            Save your favourite products here and find them easily later.
          </p>

          <Link
            to="/home"
            className="inline-flex mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            Start Browsing
          </Link>
        </div>
      )}

      {/* Wishlist products */}
      {!loading && items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {items.map((product, index) => (
            <ProductCard key={product.id} p={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
