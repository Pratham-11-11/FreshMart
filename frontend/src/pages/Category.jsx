import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/Section";
import { motion } from "framer-motion";

export default function Category() {
  const { slug } = useParams();
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, c] = await Promise.all([
        api.get(`/products${slug ? `?category=${slug}` : ""}`),
        api.get("/categories"),
      ]);
      setItems(p.data); setCats(c.data); setLoading(false);
    })();
  }, [slug]);

  const current = cats.find(c => c.slug === slug);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {!slug ? (
        <>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-3xl md:text-5xl font-extrabold" data-testid="categories-heading">All Categories</motion.h1>
          <p className="text-muted-foreground mt-2">Browse everything FreshMart has to offer.</p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {cats.map((c, i) => (
              <motion.div key={c.slug} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/category/${c.slug}`} className="block rounded-3xl overflow-hidden card-shadow group bg-card border" data-testid={`cat-tile-${c.slug}`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="text-2xl">{c.icon}</div>
                    <div className="font-heading font-semibold mt-1">{c.name}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <span className="text-4xl">{current?.icon}</span>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-extrabold" data-testid="category-heading">{current?.name || slug}</h1>
              <p className="text-muted-foreground text-sm">{items.length} products</p>
            </div>
          </motion.div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {loading ? Array(10).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />) :
              items.length === 0 ? <div className="col-span-full text-center py-16 text-muted-foreground">No products found in this category yet.</div> :
              items.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        </>
      )}
    </div>
  );
}
