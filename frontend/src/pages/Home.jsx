import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Section, Skeleton } from "@/components/Section";
import { ArrowRight, Zap, Flame, TrendingUp } from "lucide-react";

const banners = [
  {
    title: "Fresh Fruits",
    sub: "Up to 40% OFF · Handpicked daily",
    img: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1600",
    to: "/category/fruits",
    tone: "from-orange-500/20 to-primary/10",
  },
  {
    title: "Farm Vegetables",
    sub: "Locally sourced · Buy fresh",
    img: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=1600",
    to: "/category/vegetables",
    tone: "from-primary/25 to-secondary/10",
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const productsResponse = await api.get("/api/products");

        console.log("PRODUCTS FROM API:", productsResponse.data);

        setProducts(productsResponse.data);

        try {
          const categoriesResponse = await api.get("/api/categories");

          console.log("CATEGORIES FROM API:", categoriesResponse.data);

          setCategories(categoriesResponse.data);
        } catch (categoryError) {
          console.error("Categories failed:", categoryError);
          setCategories([]);
        }
      } catch (productError) {
        console.error("Products failed:", productError);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const featured = products.filter((p) => p.featured);
  const bestRated = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
  const newArrivals = products.slice(-10).reverse();

  return (
    <div className="pb-20">
      {/* Hero Bento */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`col-span-12 md:col-span-8 relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[16/7] bg-gradient-to-br ${banners[0].tone} card-shadow group`}
          >
            <img
              src={banners[0].img}
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-700"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
            <div className="relative h-full flex flex-col justify-center p-6 md:p-12 max-w-md">
              <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2">
                Today's Deals
              </span>
              <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight">
                {banners[0].title}
              </h1>
              <p className="text-muted-foreground mt-2 md:text-lg">
                {banners[0].sub}
              </p>
              <Link
                to={banners[0].to}
                className="mt-5 inline-flex items-center gap-1.5 self-start px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                data-testid="hero-cta"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 md:col-span-4 grid grid-rows-2 gap-4 md:gap-6"
          >
            {[
              banners[1],
              {
                title: "Free Delivery",
                sub: "Above ₹199",
                img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800",
                to: "/category/dairy",
                tone: "from-secondary/20 to-primary/10",
              },
            ].map((b, i) => (
              <div
                key={i}
                className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${b.tone} card-shadow group`}
              >
                <img
                  src={b.img}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-700"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-5">
                  <div className="font-heading text-xl font-bold">
                    {b.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{b.sub}</div>
                  <Link
                    to={b.to}
                    className="mt-2 text-xs font-semibold text-primary inline-flex items-center gap-1"
                  >
                    Explore <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <Section
        title="Shop by Category"
        subtitle="Fresh essentials & everyday must-haves"
        testid="section-categories"
      >
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 md:gap-4">
          {categories.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/category/${c.slug}`}
                className="flex flex-col items-center gap-2 group"
                data-testid={`category-${c.slug}`}
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-muted card-shadow relative">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="text-xs md:text-sm font-medium text-center leading-tight">
                  {c.name}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Flash Sale */}
      <Section
        title={
          <span className="flex items-center gap-2">
            <Flame className="text-secondary w-7 h-7" /> Flash Sale
          </span>
        }
        subtitle="Grab these deals before they're gone"
        action={
          <Link
            to="/search?q="
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        }
        testid="section-flash"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)
            : featured
                .slice(0, 10)
                .map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      </Section>

      {/* Best sellers */}
      <Section
        title={
          <span className="flex items-center gap-2">
            <TrendingUp className="text-primary w-7 h-7" /> Best Sellers
          </span>
        }
        subtitle="Loved by 100,000+ customers"
        testid="section-best"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {bestRated.slice(0, 10).map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </Section>

      {/* New arrivals */}
      <Section
        title={
          <span className="flex items-center gap-2">
            <Zap className="text-secondary w-7 h-7" /> New Arrivals
          </span>
        }
        subtitle="Freshly stocked, straight to your door"
        testid="section-new"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {newArrivals.slice(0, 10).map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </Section>

      {/* Footer strip */}
      <footer className="mt-10 border-t bg-muted/40">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="font-heading font-bold text-lg mb-2">FreshMart</div>
            <p className="text-muted-foreground">
              Everything you need, delivered to your door in 30 minutes.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2">Shop</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>Fruits & Veg</li>
              <li>Dairy</li>
              <li>Snacks</li>
              <li>Beverages</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Company</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Help</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>FAQ</li>
              <li>Delivery</li>
              <li>Returns</li>
              <li>Support</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground pb-6">
          © 2026 FreshMart · Made with 💚
        </div>
      </footer>
    </div>
  );
}
