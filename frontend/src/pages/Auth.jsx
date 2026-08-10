import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Auth({ mode = "login" }) {
  const { login, register } = useApp();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      nav("/home");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally { setLoading(false); }
  };

  const input = "w-full px-4 py-3 rounded-xl bg-muted border border-transparent focus:border-primary outline-none text-sm";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass rounded-3xl p-8 card-shadow">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl mx-auto">F</div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-center mt-4" data-testid={`${mode}-heading`}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-center text-muted-foreground text-sm mt-1">
          {isLogin ? "Sign in to continue shopping" : "Join FreshMart and start saving"}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {!isLogin && (
            <input placeholder="Full name" required className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-testid="auth-name" />
          )}
          <input type="email" placeholder="Email address" required className={input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} data-testid="auth-email" />
          <input type="password" placeholder="Password" required minLength={6} className={input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} data-testid="auth-password" />
          <button disabled={loading} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-heading font-semibold hover:opacity-90 disabled:opacity-60" data-testid="auth-submit">
            {loading ? "Please wait…" : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <>New here? <Link to="/signup" className="text-primary font-semibold hover:underline" data-testid="switch-to-signup">Create an account</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline" data-testid="switch-to-login">Sign in</Link></>
          )}
        </div>

        {isLogin && (
          <div className="mt-4 p-3 rounded-2xl bg-muted/60 text-xs text-muted-foreground text-center">
            Try demo: <b>demo@freshmart.com</b> / <b>demo123</b>
          </div>
        )}
      </motion.div>
    </div>
  );
}
