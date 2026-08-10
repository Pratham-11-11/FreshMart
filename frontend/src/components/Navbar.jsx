import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Heart, User, Moon, Sun, Package, Sparkles, LogOut } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function Navbar() {
  const { user, cartCount, dark, setDark, logout, wishlist } = useApp();
  const nav = useNavigate();
  const [q, setQ] = React.useState("");

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3 md:gap-6">
        <Link to="/home" className="flex items-center gap-2 shrink-0" data-testid="nav-logo">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">F</div>
          <span className="font-heading font-bold text-lg md:text-xl hidden sm:inline">FreshMart</span>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              data-testid="search-input"
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder='Search "fresh mangoes", "milk"...'
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-muted/70 border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-colors"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={() => setDark(!dark)} className="p-2.5 rounded-full hover:bg-muted transition-colors" data-testid="dark-toggle" aria-label="Toggle dark mode">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/wishlist" className="p-2.5 rounded-full hover:bg-muted relative transition-colors" data-testid="nav-wishlist">
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="p-2.5 rounded-full hover:bg-muted relative transition-colors" data-testid="nav-cart">
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
          </Link>
          <Link to="/orders" className="p-2.5 rounded-full hover:bg-muted transition-colors hidden md:inline-flex" data-testid="nav-orders">
            <Package className="w-4 h-4" />
          </Link>
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-muted transition-colors" data-testid="user-menu">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</div>
                <span className="text-sm font-medium hidden md:inline">{user.name?.split(" ")[0]}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl p-2 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                <Link to="/orders" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted text-sm"><Package className="w-4 h-4"/>My Orders</Link>
                {user.role === "admin" && <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted text-sm" data-testid="admin-link"><Sparkles className="w-4 h-4"/>Admin Panel</Link>}
                <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted text-sm w-full text-left text-destructive" data-testid="logout-btn"><LogOut className="w-4 h-4"/>Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity" data-testid="login-link">
              <User className="w-4 h-4" /> <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
