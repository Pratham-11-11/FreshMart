import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { Users, Package, ShoppingBag, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Admin() {
  const { user } = useApp();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (user?.role === "admin") {
      api.get("/admin/stats").then(r => setStats(r.data)).catch(() => {});
    }
  }, [user]);

  if (!user) return <div className="p-10 text-center">Please <Link to="/login" className="text-primary underline">sign in</Link>.</div>;
  if (user.role !== "admin") return (
    <div className="p-10 text-center">
      <h2 className="font-heading text-2xl font-bold">Admin Only</h2>
      <p className="text-muted-foreground mt-2">Sign in as an admin to access this dashboard.</p>
      <div className="mt-4 text-xs text-muted-foreground">Demo admin: <b>admin@freshmart.com</b> / <b>admin123</b></div>
    </div>
  );
  if (!stats) return <div className="p-10 text-center animate-pulse">Loading dashboard…</div>;

  const cards = [
    { i: IndianRupee, l: "Revenue", v: `₹${stats.revenue.toLocaleString()}`, c: "from-primary/20 to-primary/5" },
    { i: ShoppingBag, l: "Orders", v: stats.orders, c: "from-secondary/20 to-secondary/5" },
    { i: Package, l: "Products", v: stats.products, c: "from-primary/20 to-primary/5" },
    { i: Users, l: "Users", v: stats.users, c: "from-secondary/20 to-secondary/5" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold" data-testid="admin-heading">Admin Dashboard</h1>
      <p className="text-muted-foreground">Overview of your store performance</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`p-5 rounded-3xl bg-gradient-to-br ${c.c} border card-shadow`}>
            <c.i className="w-6 h-6 text-primary" />
            <div className="mt-4 font-heading text-3xl font-extrabold">{c.v}</div>
            <div className="text-sm text-muted-foreground">{c.l}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-2xl font-bold">Recent Orders</h2>
        <div className="mt-4 rounded-3xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="text-left">
                <th className="p-3 font-medium">Order ID</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-3">{o.items.length}</td>
                  <td className="p-3 font-semibold">₹{o.total}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{o.status}</span></td>
                </tr>
              ))}
              {stats.recent_orders.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
