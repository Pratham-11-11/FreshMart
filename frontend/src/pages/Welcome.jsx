import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Compass, Truck, Users, Package, Clock } from "lucide-react";

const floatImgs = [
  { src: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200", top: "8%", left: "6%", delay: 0, size: 90 },
  { src: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200", top: "18%", right: "8%", delay: 0.4, size: 110 },
  { src: "https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?w=200", bottom: "22%", left: "10%", delay: 0.8, size: 80 },
  { src: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200", top: "60%", right: "6%", delay: 0.6, size: 100 },
  { src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200", bottom: "10%", right: "20%", delay: 1.0, size: 85 },
  { src: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=200", top: "45%", left: "3%", delay: 0.3, size: 95 },
  { src: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200", top: "30%", left: "45%", delay: 0.9, size: 70 },
];

function Counter({ end, duration = 1600, suffix = "+" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = Date.now();
    let raf;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setN(Math.floor(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

const stats = [
  { end: 100000, label: "Happy Customers", icon: Users, suffix: "+" },
  { end: 50000, label: "Orders Delivered", icon: Package, suffix: "+" },
  { end: 10000, label: "Products", icon: ShoppingBag, suffix: "+" },
  { end: 30, label: "Minute Delivery", icon: Clock, suffix: "" },
];

export default function Welcome() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden gradient-hero">
      {/* Floating decorative images */}
      {floatImgs.map((f, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full overflow-hidden shadow-2xl ring-4 ring-white/40 dark:ring-white/10 hidden md:block"
          style={{ ...f, width: f.size, height: f.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -18, 0] }}
          transition={{ opacity: { delay: f.delay, duration: 0.6 }, scale: { delay: f.delay, duration: 0.6 }, y: { repeat: Infinity, duration: 5 + i * 0.4, ease: "easeInOut", delay: f.delay } }}
        >
          <img src={f.src} alt="" className="w-full h-full object-cover" />
        </motion.div>
      ))}

      {/* Delivery bike drifting */}
      <div className="absolute top-1/2 left-0 w-full pointer-events-none hidden md:block">
        <motion.div
          className="text-6xl"
          initial={{ x: "-10%" }}
          animate={{ x: "110vw" }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        >🛵</motion.div>
      </div>

      {/* Center content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur border border-white/50 dark:border-white/10 text-xs font-semibold text-primary mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Delivering fresh in 30 minutes
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl text-shadow-glow"
          data-testid="welcome-heading"
        >
          🛒 Welcome to <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">FreshMart</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-5 text-lg md:text-2xl font-heading font-medium text-foreground/80 max-w-2xl"
        >
          Everything You Need, Delivered to Your Door.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl"
        >
          Fresh groceries, dairy, snacks, beverages, household essentials, personal care, and much more.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link to="/home" data-testid="start-shopping-btn">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-heading font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-shadow">
              <ShoppingBag className="w-5 h-5" /> Start Shopping
            </motion.div>
          </Link>
          <Link to="/categories" data-testid="explore-categories-btn">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur border border-border font-heading font-semibold hover:bg-white transition-colors">
              <Compass className="w-5 h-5" /> Explore Categories
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="glass rounded-3xl p-5 md:p-6 card-shadow"
            >
              <s.icon className="w-6 h-6 text-primary mb-3 mx-auto" />
              <div className="font-heading text-2xl md:text-4xl font-extrabold text-primary">
                <Counter end={s.end} suffix={s.suffix} />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-14 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Truck className="w-4 h-4 text-primary" /> Scroll down or tap Start Shopping to enter the store ↓
        </motion.div>
      </div>
    </div>
  );
}
