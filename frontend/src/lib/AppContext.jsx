import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "./api";
import { toast } from "sonner";

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("fm_user") || "null");
  } catch {
    return null;
  }
}

function getStoredWishlist() {
  try {
    return JSON.parse(localStorage.getItem("fm_wishlist") || "[]");
  } catch {
    return [];
  }
}

export function AppProvider({ children }) {
  // ---------------------------------------------------------
  // USER
  // ---------------------------------------------------------

  const [user, setUser] = useState(getStoredUser);

  // ---------------------------------------------------------
  // CART
  // ---------------------------------------------------------

  const [cart, setCart] = useState({
    items: [],
    products: [],
  });

  // ---------------------------------------------------------
  // WISHLIST
  // ---------------------------------------------------------

  const [wishlist, setWishlist] = useState(getStoredWishlist);

  // ---------------------------------------------------------
  // DARK MODE
  // ---------------------------------------------------------

  const [dark, setDark] = useState(
    () => localStorage.getItem("fm_dark") === "1",
  );

  // ---------------------------------------------------------
  // DARK MODE EFFECT
  // ---------------------------------------------------------

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    localStorage.setItem("fm_dark", dark ? "1" : "0");
  }, [dark]);

  // ---------------------------------------------------------
  // WISHLIST EFFECT
  // ---------------------------------------------------------

  useEffect(() => {
    localStorage.setItem("fm_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ---------------------------------------------------------
  // SAVE USER
  // ---------------------------------------------------------

  const saveUserSession = useCallback((token, userData) => {
    localStorage.setItem("fm_token", token);
    localStorage.setItem("fm_user", JSON.stringify(userData));

    setUser(userData);
  }, []);

  // ---------------------------------------------------------
  // CLEAR SESSION
  // ---------------------------------------------------------

  const clearSession = useCallback(() => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");

    setUser(null);

    setCart({
      items: [],
      products: [],
    });
  }, []);

  // ---------------------------------------------------------
  // REFRESH CART
  // ---------------------------------------------------------

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
        items: Array.isArray(response.data?.items) ? response.data.items : [],

        products: Array.isArray(response.data?.products)
          ? response.data.products
          : [],
      });
    } catch (error) {
      console.error("Failed to load cart:", error);

      if (error.response?.status === 401) {
        clearSession();
        toast.error("Your session has expired. Please login again.");
      }

      setCart({
        items: [],
        products: [],
      });
    }
  }, [user, clearSession]);

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      saveUserSession(data.token, data.user);

      await refreshCart();

      toast.success(`Welcome back, ${data.user.name}!`);

      return data.user;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Login failed";

      toast.error(message);

      throw error;
    }
  };

  // ---------------------------------------------------------
  // REGISTER
  // ---------------------------------------------------------

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const data = response.data;

      saveUserSession(data.token, data.user);

      await refreshCart();

      toast.success(`Welcome to FreshMart, ${data.user.name}!`);

      return data.user;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Registration failed";

      toast.error(message);

      throw error;
    }
  };

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  const logout = useCallback(() => {
    clearSession();

    toast.success("Logged out successfully");
  }, [clearSession]);

  // ---------------------------------------------------------
  // ADD TO CART
  // ---------------------------------------------------------

  const addToCart = async (productId, qty = 1) => {
    if (!user) {
      toast.error("Please login to add items to your cart");
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
      console.error("Add to cart error:", error);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Could not add product";

      toast.error(message);

      return false;
    }
  };

  // ---------------------------------------------------------
  // SET CART QUANTITY
  // ---------------------------------------------------------

  const setQty = async (productId, qty) => {
    if (!user) {
      toast.error("Please login first");
      return false;
    }

    try {
      if (qty <= 0) {
        await api.delete(`/cart/${productId}`);
      } else {
        await api.put(`/cart/${productId}`, null, {
          params: {
            qty,
          },
        });
      }

      await refreshCart();

      return true;
    } catch (error) {
      console.error("Quantity update error:", error);

      toast.error(error.response?.data?.detail || "Could not update cart");

      return false;
    }
  };

  // ---------------------------------------------------------
  // REMOVE FROM CART
  // ---------------------------------------------------------

  const removeFromCart = async (productId) => {
    if (!user) {
      toast.error("Please login first");
      return false;
    }

    try {
      await api.delete(`/cart/${productId}`);

      await refreshCart();

      toast.success("Removed from cart");

      return true;
    } catch (error) {
      console.error("Remove cart error:", error);

      toast.error(error.response?.data?.detail || "Could not remove item");

      return false;
    }
  };

  // ---------------------------------------------------------
  // WISHLIST
  // ---------------------------------------------------------

  const toggleWishlist = (productId) => {
    setWishlist((current) => {
      if (current.includes(productId)) {
        toast.success("Removed from wishlist");

        return current.filter((id) => id !== productId);
      }

      toast.success("Added to wishlist");

      return [...current, productId];
    });
  };

  const isWishlisted = useCallback(
    (productId) => wishlist.includes(productId),
    [wishlist],
  );

  // ---------------------------------------------------------
  // CART COUNT
  // ---------------------------------------------------------

  const cartCount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  }, [cart.items]);

  // ---------------------------------------------------------
  // CART TOTAL
  // ---------------------------------------------------------

  const cartTotal = useMemo(() => {
    return cart.items.reduce((sum, item) => {
      const product = cart.products.find((p) => p.id === item.product_id);

      if (!product) {
        return sum;
      }

      return sum + Number(product.price || 0) * Number(item.qty || 0);
    }, 0);
  }, [cart.items, cart.products]);

  // ---------------------------------------------------------
  // INITIAL CART LOAD
  // ---------------------------------------------------------

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart({
        items: [],
        products: [],
      });
    }
  }, [user, refreshCart]);

  // ---------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------

  const value = useMemo(
    () => ({
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
      isWishlisted,

      dark,
      setDark,
    }),
    [
      user,
      cart,
      refreshCart,
      addToCart,
      setQty,
      removeFromCart,
      cartCount,
      cartTotal,
      wishlist,
      isWishlisted,
      dark,
      login,
      register,
      logout,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
