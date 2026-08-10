import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/Section";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.get(`/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setItems(data); setLoading(false);
    })();
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="font-heading text-2xl md:text-3xl font-extrabold" data-testid="search-heading">
        {q ? `Results for "${q}"` : "All Products"} <span className="text-muted-foreground text-base font-medium">({items.length})</span>
      </h1>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {loading ? Array(10).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />) :
          items.length === 0 ? <div className="col-span-full text-center py-16 text-muted-foreground">No products found. Try a different search.</div> :
          items.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
      </div>
    </div>
  );
}
