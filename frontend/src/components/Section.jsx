import React from "react";
import { motion } from "framer-motion";

export function Section({ title, subtitle, children, action, testid }) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14" data-testid={testid}>
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading font-bold text-2xl md:text-4xl tracking-tight">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>}
        </motion.div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-muted rounded-2xl ${className}`} />;
}
