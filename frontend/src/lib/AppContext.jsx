import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { api } from "./api";
import { toast } from "sonner";

const Ctx = createContext(null);

export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fm_user") || "null");
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState({
    items: [],
    products: [],
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fm_wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const [dark, setDark] = useState(
    () => localStorage.getItem("fm_dark") === "1",
  );

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    localStorage.setItem("fm_dark", dark ? "1" : "0");
  }, [dark]);

  // Wishlist
  useEffect(() => {
    localStorage.setItem("fm_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Load cart
  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem("fm_token");

    if (!token || !user) {
      setCart({
        items: [],
        products: [],
      });
      return;
    }

    try {
      const response = await api.get("/cart");

      setCart({
        items: response.data?.items || [],
        products: response.data?.products || [],
      });
    } catch (error) {
      console.error("Failed to load cart:", error);

      setCart({
        items: [],
        products: [],
      });
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("fm_token", data.token);

      localStorage.setItem("fm_user", JSON.stringify(data.user));

      setUser(data.user);

      toast.success(`Welcome back, ${data.user.name}!`);

      return data.user;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");

      throw error;
    }
  };

  // REGISTER
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("fm_token", data.token);

      localStorage.setItem("fm_user", JSON.stringify(data.user));

      setUser(data.user);

      toast.success(`Welcome to FreshMart, ${data.user.name}!`);

      return data.user;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");

      throw error;
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");

    setUser(null);

    setCart({
      items: [],
      products: [],
    });

    toast.success("Logged out");
  };

  // ADD TO CART
  const addToCart = async (productId, qty = 1) => {
    if (!user) {
      toast.error("Please login to add items");

      return false;
    }

    try {
      await api.post("/cart", {
        product_id: productId,
        qty,
      });

      await refreshCart();

      toast.success("Added to cart");

      return true;
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.detail || "Could not add product");

      return false;
    }
  };

  // UPDATE QUANTITY
  const setQty = async (productId, qty) => {
    if (!user) return;

    try {
      if (qty <= 0) {
        await api.delete(`/cart/${productId}`);
      } else {
        await api.put(`/cart/${productId}?qty=${qty}`);
      }

      await refreshCart();
    } catch (error) {
      console.error(error);

      toast.error("Could not update cart");
    }
  };

  // REMOVE FROM CART
  const removeFromCart = async (productId) => {
    if (!user) return;

    try {
      await api.delete(`/cart/${productId}`);

      await refreshCart();

      toast.success("Removed from cart");
    } catch (error) {
      console.error(error);

      toast.error("Could not remove item");
    }
  };

  // WISHLIST
  const toggleWishlist = (id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // CART COUNT
  const cartCount = cart.items.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  // CART TOTAL
  const cartTotal = cart.items.reduce((sum, item) => {
    const product = cart.products.find((p) => p.id === item.product_id);

    if (!product) {
      return sum;
    }

    return sum + Number(product.price || 0) * Number(item.qty || 0);
  }, 0);

  return (
    <Ctx.Provider
      value={{
        user,

        login,
        register,
        logout,

        cart,
        refreshCart,

        addToCart,
        setQty,
        removeFromCart,

        cartCount,
        cartTotal,

        wishlist,
        toggleWishlist,

        dark,
        setDark,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
