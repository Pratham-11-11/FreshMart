import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const categoryIcons = {
  fruits: "🍎",
  vegetables: "🥦",
  dairy: "🥛",
  bakery: "🍞",
  snacks: "🍿",
  beverages: "🥤",
  staples: "🌾",
  "personal-care": "🧴",
  cleaning: "🧽",
  kitchen: "🍳",
};

function App() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("freshmart_user")) || null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const token = localStorage.getItem("freshmart_token");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  };

  const fetchProducts = async (category = "", query = "") => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (category) params.set("category", category);
      if (query.trim()) params.set("q", query.trim());

      params.set("limit", "100");

      const response = await fetch(`${API_URL}/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Unable to load products");
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast("Unable to load products. Check your backend.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);

      if (!response.ok) throw new Error("Unable to load categories");

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCart = async () => {
    const savedToken = localStorage.getItem("freshmart_token");

    if (!savedToken) {
      setCart([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout(false);
        }
        return;
      }

      const data = await response.json();

      const items = data.items || [];

      setCart(
        items.map((item) => {
          const product = (data.products || []).find(
            (p) => p.id === item.product_id,
          );

          return {
            ...item,
            product,
          };
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotifications = async () => {
    const savedToken = localStorage.getItem("freshmart_token");

    if (!savedToken) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const markAllNotificationsRead = async () => {
    const savedToken = localStorage.getItem("freshmart_token");
    if (!savedToken) return;

    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const notifyMe = async (product) => {
    const savedToken = localStorage.getItem("freshmart_token");

    if (!savedToken) {
      setLoginOpen(true);
      showToast("Login to get notified when this is back in stock");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/products/${product.id}/notify-me`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${savedToken}` },
        },
      );

      const data = await response.json();
      showToast(data.message || "We'll notify you when it's back");
    } catch (error) {
      console.error(error);
      showToast("Could not set up notification");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    loadCart();
    fetchNotifications();

    // Poll for new notifications (e.g. products the user asked to be
    // notified about coming back in stock) every 20 seconds.
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchProducts(activeCategory, search);
  };

  const selectCategory = (slug) => {
    setActiveCategory(slug);
    fetchProducts(slug, search);
    window.scrollTo({
      top: document.getElementById("products")?.offsetTop - 90 || 0,
      behavior: "smooth",
    });
  };

  const addToCart = async (product) => {
    const savedToken = localStorage.getItem("freshmart_token");

    if (!savedToken) {
      setLoginOpen(true);
      showToast("Login to add products to your cart");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          qty: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not add product");
      }

      await loadCart();

      setCartOpen(true);
      showToast(`${product.name} added to cart`);
    } catch (error) {
      console.error(error);
      showToast("Could not add product to cart");
    }
  };

  const changeQuantity = async (productId, quantity) => {
    const savedToken = localStorage.getItem("freshmart_token");

    if (!savedToken) return;

    try {
      if (quantity <= 0) {
        await fetch(`${API_URL}/cart/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
      } else {
        await fetch(`${API_URL}/cart/${productId}?qty=${quantity}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
      }

      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    const isSignup = authMode === "signup";
    const endpoint = isSignup ? "/auth/register" : "/auth/login";
    const body = isSignup
      ? { name: signupName, email: loginEmail, password: loginPassword }
      : { email: loginEmail, password: loginPassword };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            (isSignup ? "Could not create account" : "Invalid credentials"),
        );
      }

      localStorage.setItem("freshmart_token", data.token);
      localStorage.setItem("freshmart_user", JSON.stringify(data.user));

      setUser(data.user);
      setLoginOpen(false);
      setLoginEmail("");
      setLoginPassword("");
      setSignupName("");

      await loadCart();
      await fetchNotifications();

      showToast(
        isSignup
          ? `Welcome to FreshMart, ${data.user.name}!`
          : `Welcome back, ${data.user.name}!`,
      );
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = (showMessage = true) => {
    localStorage.removeItem("freshmart_token");
    localStorage.removeItem("freshmart_user");

    setUser(null);
    setCart([]);

    if (showMessage) {
      showToast("You have been logged out");
    }
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.qty || 0), 0),
    [cart],
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (item.product?.price || 0) * (item.qty || 0),
        0,
      ),
    [cart],
  );

  const featuredProducts = products.filter((product) => product.featured);

  // ---------------------------------------------------------------------
  // HOME PAGE (this is your original homepage JSX, unchanged, now mounted
  // under a route so navigating away from it actually shows something else)
  // ---------------------------------------------------------------------
  const homePage = (
    <div className="freshmart-app">
      {/* TOP ANNOUNCEMENT */}
      <div className="announcement">
        <div className="container announcement-inner">
          <span>⚡</span>
          <strong>Fresh groceries delivered in 30 minutes</strong>
          <span className="announcement-divider">•</span>
          <span>Free delivery on orders above ₹199</span>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="navbar">
        <div className="container navbar-inner">
          <button
            className="brand"
            onClick={() => {
              setActiveCategory("");
              setSearch("");
              fetchProducts();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="brand-icon">🛒</div>

            <div>
              <div className="brand-name">
                Fresh<span>Mart</span>
              </div>

              <div className="brand-subtitle">Everyday freshness</div>
            </div>
          </button>

          <button className="location-button">
            <span className="location-icon">⌖</span>

            <span>
              <small>Deliver to</small>
              <strong>Ratnagiri, Maharashtra</strong>
            </span>

            <span className="chevron">⌄</span>
          </button>

          <form className="search-box" onSubmit={handleSearch}>
            <span className="search-icon">⌕</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for fruits, milk, snacks and more..."
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearch("");
                  fetchProducts(activeCategory, "");
                }}
              >
                ×
              </button>
            )}

            <button type="submit" className="search-submit">
              Search
            </button>
          </form>

          <div className="nav-actions">
            {user?.role === "admin" && (
              <button
                className="secondary-button"
                onClick={() => navigate("/admin")}
              >
                Admin panel
              </button>
            )}

            {user ? (
              <button className="account-button">
                <span className="account-avatar">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="account-text">
                  <small>Hello</small>
                  <strong>{user.name?.split(" ")[0]}</strong>
                </span>

                <span
                  className="logout-small"
                  onClick={(event) => {
                    event.stopPropagation();
                    logout();
                  }}
                >
                  ↪
                </span>
              </button>
            ) : (
              <button
                className="login-button"
                onClick={() => setLoginOpen(true)}
              >
                <span>♙</span>
                <strong>Login</strong>
              </button>
            )}

            {user && (
              <div style={{ position: "relative" }}>
                <button
                  className="cart-button"
                  aria-label="Notifications"
                  onClick={() => {
                    const opening = !notifOpen;
                    setNotifOpen(opening);
                    if (opening) fetchNotifications();
                  }}
                >
                  <span className="cart-icon">🔔</span>
                  {unreadCount > 0 && (
                    <span className="cart-badge">{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "110%",
                      width: 320,
                      maxHeight: 380,
                      overflowY: "auto",
                      background: "#fff",
                      borderRadius: 12,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                      zIndex: 50,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <strong>Notifications</strong>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#22c55e",
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p style={{ fontSize: 14, color: "#666" }}>
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid #eee",
                            background: n.read ? "transparent" : "#f0fdf4",
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        >
                          {n.message}
                          <div
                            style={{
                              fontSize: 12,
                              color: "#999",
                              marginTop: 4,
                            }}
                          >
                            {new Date(n.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              className="cart-button"
              onClick={() => {
                if (!user) {
                  setLoginOpen(true);
                  return;
                }

                setCartOpen(true);
              }}
            >
              <span className="cart-icon">🛍</span>

              <span className="cart-text">
                <small>Cart</small>
                <strong>₹{cartTotal.toFixed(0)}</strong>
              </span>

              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORY NAVIGATION */}
      <nav className="category-nav">
        <div className="container category-nav-inner">
          <button
            className={`category-link ${activeCategory === "" ? "active" : ""}`}
            onClick={() => selectCategory("")}
          >
            <span>✨</span>
            All
          </button>

          {categories.slice(0, 8).map((category) => (
            <button
              key={category.slug}
              className={`category-link ${
                activeCategory === category.slug ? "active" : ""
              }`}
              onClick={() => selectCategory(category.slug)}
            >
              <span>
                {category.icon || categoryIcons[category.slug] || "🛒"}
              </span>

              {category.name}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="hero-pill">
                <span className="pulse-dot"></span>
                Freshness delivered fast
              </div>

              <h1>
                Your daily groceries,
                <span> delivered fresh.</span>
              </h1>

              <p>
                From farm-fresh fruits and vegetables to dairy, bakery and
                everyday essentials — everything you need, right at your
                doorstep.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-button"
                  onClick={() =>
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Shop groceries
                  <span>→</span>
                </button>

                <button
                  className="secondary-button"
                  onClick={() => {
                    document
                      .getElementById("categories")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore categories
                </button>
              </div>

              <div className="hero-benefits">
                <div>
                  <span>🚴</span>
                  <div>
                    <strong>30 min</strong>
                    <small>Fast delivery</small>
                  </div>
                </div>

                <div>
                  <span>🥬</span>
                  <div>
                    <strong>Fresh daily</strong>
                    <small>Quality products</small>
                  </div>
                </div>

                <div>
                  <span>🔒</span>
                  <div>
                    <strong>Secure</strong>
                    <small>Safe checkout</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-circle hero-circle-one"></div>
              <div className="hero-circle hero-circle-two"></div>

              <div className="hero-main-card">
                <img
                  src={
                    featuredProducts[0]?.image ||
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000"
                  }
                  alt="Fresh groceries"
                />

                <div className="hero-floating-card delivery-card">
                  <div className="floating-icon">🚴</div>

                  <div>
                    <strong>Arrives in 20–30 min</strong>
                    <span>Freshness guaranteed</span>
                  </div>
                </div>

                <div className="hero-floating-card rating-card">
                  <div className="rating-stars">★★★★★</div>
                  <strong>4.8/5</strong>
                  <span>Happy shoppers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY SECTION */}
        <section className="categories-section" id="categories">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">SHOP YOUR WAY</span>
                <h2>Browse by category</h2>
                <p>Everything you need for your home, all in one place.</p>
              </div>

              <button
                onClick={() => selectCategory("")}
                className="view-all-button"
              >
                View all →
              </button>
            </div>

            <div className="category-grid">
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category.slug}
                  className="category-card"
                  onClick={() => selectCategory(category.slug)}
                >
                  <div className="category-image">
                    <img src={category.image} alt={category.name} />

                    <span className="category-emoji">
                      {category.icon || categoryIcons[category.slug] || "🛒"}
                    </span>
                  </div>

                  <strong>{category.name}</strong>
                  <span>Shop now →</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        {featuredProducts.length > 0 && (
          <section className="products-section featured-section">
            <div className="container">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">HANDPICKED FOR YOU</span>
                  <h2>Fresh picks</h2>
                  <p>Popular products loved by FreshMart shoppers.</p>
                </div>

                <button
                  className="view-all-button"
                  onClick={() => selectCategory("")}
                >
                  View all →
                </button>
              </div>

              <div className="product-grid">
                {featuredProducts.slice(0, 6).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    notifyMe={notifyMe}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ALL PRODUCTS */}
        <section className="products-section" id="products">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">FRESH EVERY DAY</span>

                <h2>
                  {activeCategory
                    ? categories.find((c) => c.slug === activeCategory)?.name ||
                      "Products"
                    : search
                      ? `Results for "${search}"`
                      : "Shop all groceries"}
                </h2>

                <p>
                  {loading
                    ? "Finding the freshest products..."
                    : `${products.length} products available`}
                </p>
              </div>

              <div className="sort-control">
                <span>Sort by</span>
                <select>
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highest Rated</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div className="product-skeleton" key={index}>
                    <div className="skeleton-image"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-price"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-products">
                <div>🔎</div>
                <h3>No products found</h3>
                <p>Try another search or choose a different category.</p>

                <button
                  className="primary-button small"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("");
                    fetchProducts();
                  }}
                >
                  Show all products
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    notifyMe={notifyMe}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PROMO BANNER */}
        <section className="promo-section">
          <div className="container">
            <div className="promo-banner">
              <div className="promo-content">
                <span className="eyebrow light">FRESHMART SPECIAL</span>

                <h2>Fresh savings every day.</h2>

                <p>
                  Get 10% off your next order with coupon
                  <strong> FRESH10</strong>.
                </p>

                <button
                  className="promo-button"
                  onClick={() => {
                    navigator.clipboard?.writeText("FRESH10");
                    showToast("Coupon FRESH10 copied");
                  }}
                >
                  Copy coupon
                </button>
              </div>

              <div className="promo-art">
                <span>🥦</span>
                <span>🍎</span>
                <span>🥛</span>
                <span>🍞</span>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="trust-section">
          <div className="container trust-grid">
            <TrustItem
              icon="🚴"
              title="Lightning-fast delivery"
              text="Fresh groceries at your door in 30 minutes."
            />

            <TrustItem
              icon="🌱"
              title="Quality you can trust"
              text="Fresh products selected with care every day."
            />

            <TrustItem
              icon="💳"
              title="Secure payments"
              text="Safe and simple checkout experience."
            />

            <TrustItem
              icon="💬"
              title="We're here to help"
              text="Friendly support whenever you need us."
            />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand footer-brand">
              <div className="brand-icon">🛒</div>
              <div>
                <div className="brand-name">
                  Fresh<span>Mart</span>
                </div>
                <div className="brand-subtitle">Everyday freshness</div>
              </div>
            </div>

            <p>
              Fresh groceries, everyday essentials and everything your home
              needs — delivered to your door.
            </p>
          </div>

          <div>
            <h4>Shop</h4>
            <button onClick={() => selectCategory("fruits")}>Fruits</button>
            <button onClick={() => selectCategory("vegetables")}>
              Vegetables
            </button>
            <button onClick={() => selectCategory("dairy")}>
              Milk & Dairy
            </button>
            <button onClick={() => selectCategory("bakery")}>Bakery</button>
          </div>

          <div>
            <h4>FreshMart</h4>
            <button>About us</button>
            <button>Contact</button>
            <button>Delivery information</button>
            <button>Help center</button>
          </div>

          <div>
            <h4>Download the app</h4>
            <p className="footer-small">
              Shop faster with the FreshMart mobile experience.
            </p>

            <div className="app-buttons">
              <button> App Store</button>
              <button>▶ Google Play</button>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 FreshMart. All rights reserved.</span>
          <span>Made fresh for everyday shopping.</span>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="modal-backdrop" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow">YOUR BAG</span>
                <h2>Shopping cart</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setCartOpen(false)}
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛍️</div>
                <h3>Your cart is empty</h3>
                <p>Add something fresh to get started.</p>

                <button
                  className="primary-button"
                  onClick={() => setCartOpen(false)}
                >
                  Start shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.product_id}>
                      <img src={item.product?.image} alt={item.product?.name} />

                      <div className="cart-item-info">
                        <strong>{item.product?.name}</strong>
                        <span>{item.product?.weight}</span>
                        <b>₹{item.product?.price}</b>

                        <div className="quantity-control">
                          <button
                            onClick={() =>
                              changeQuantity(item.product_id, item.qty - 1)
                            }
                          >
                            −
                          </button>

                          <span>{item.qty}</span>

                          <button
                            onClick={() =>
                              changeQuantity(item.product_id, item.qty + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>₹{cartTotal.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>Delivery</span>
                    <strong>{cartTotal >= 199 ? "FREE" : "₹29"}</strong>
                  </div>

                  <div className="cart-total">
                    <span>Total</span>
                    <strong>
                      ₹{(cartTotal + (cartTotal >= 199 ? 0 : 29)).toFixed(2)}
                    </strong>
                  </div>

                  <button
                    className="checkout-button"
                    onClick={() => {
                      setCartOpen(false);
                      navigate("/checkout");
                    }}
                  >
                    Proceed to checkout →
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* LOGIN MODAL */}
      {loginOpen && (
        <div className="modal-backdrop" onClick={() => setLoginOpen(false)}>
          <div
            className="login-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button modal-close"
              onClick={() => setLoginOpen(false)}
            >
              ×
            </button>

            <div className="login-logo">🛒</div>

            <span className="eyebrow">
              {authMode === "signup" ? "JOIN FRESHMART" : "WELCOME BACK"}
            </span>

            <h2>
              {authMode === "signup"
                ? "Create your account"
                : "Login to FreshMart"}
            </h2>

            <p>
              {authMode === "signup"
                ? "Sign up to start shopping fresh groceries."
                : "Sign in to add products to your cart and continue shopping."}
            </p>

            {loginError && <div className="login-error">{loginError}</div>}

            <form onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <>
                  <label>Name</label>

                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </>
              )}

              <label>Email</label>

              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />

              <label>Password</label>

              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                minLength={authMode === "signup" ? 6 : undefined}
              />

              <button className="checkout-button" disabled={loginLoading}>
                {loginLoading
                  ? authMode === "signup"
                    ? "Creating account..."
                    : "Signing in..."
                  : authMode === "signup"
                    ? "Create account"
                    : "Login to FreshMart"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 12, fontSize: 14 }}>
              {authMode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setLoginError("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#22c55e",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  New to FreshMart?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setLoginError("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#22c55e",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>

            {authMode === "login" && (
              <div className="demo-login" style={{ display: "flex" }}>
                <button
                  type="button"
                  className="secondary-button small"
                  onClick={() => {}}
                >
                  <strong>Welcome To Freshmart</strong>
                  <span></span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );

  // ---------------------------------------------------------------------
  // THE ACTUAL FIX: without <Routes>, calling navigate("/checkout") only
  // changed the browser URL — nothing ever told React to render a
  // different component, so the homepage kept showing. This <Routes>
  // block is what was missing.
  // ---------------------------------------------------------------------
  return (
    <Routes>
      <Route path="/" element={homePage} />
      <Route
        path="/checkout"
        element={
          <CheckoutPage
            user={user}
            token={token}
            cart={cart}
            cartTotal={cartTotal}
            navigate={navigate}
            showToast={showToast}
          />
        }
      />
      <Route
        path="/orders"
        element={<OrdersPage token={token} navigate={navigate} />}
      />
      <Route
        path="/admin"
        element={<AdminPage user={user} token={token} navigate={navigate} />}
      />
      {/* Any unknown URL falls back to the homepage instead of a blank page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ---------------------------------------------------------------------
// Minimal checkout page. Reuses the same cart/user/token state as the
// homepage (no separate context, no different localStorage keys), so it
// works with your existing login flow without touching it.
// ---------------------------------------------------------------------
function CheckoutPage({ user, token, cart, cartTotal, navigate, showToast }) {
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [coupon, setCoupon] = useState("");
  const [placing, setPlacing] = useState(false);

  const deliveryFee = cartTotal >= 199 ? 0 : 29;
  const total = cartTotal + deliveryFee;

  if (!user) {
    return (
      <div className="empty-products" style={{ padding: "60px 20px" }}>
        <div>🔒</div>
        <h3>Please login to checkout</h3>
        <button className="primary-button small" onClick={() => navigate("/")}>
          Back to home
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart" style={{ padding: "60px 20px" }}>
        <div className="empty-cart-icon">🛍️</div>
        <h3>Your cart is empty</h3>
        <p>Add something fresh before checking out.</p>
        <button className="primary-button" onClick={() => navigate("/")}>
          Start shopping
        </button>
      </div>
    );
  }

  const placeOrder = async () => {
    if (!address.line1 || !address.city || !address.pincode) {
      showToast("Please fill in your delivery address");
      return;
    }

    setPlacing(true);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          payment_method: paymentMethod,
          coupon: coupon || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not place order");
      }

      showToast("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: 720 }}>
      <button
        className="secondary-button"
        onClick={() => navigate("/")}
        style={{ marginBottom: 24 }}
      >
        ← Back to shopping
      </button>

      <h2>Checkout</h2>

      <div style={{ marginTop: 24 }}>
        <h3>Delivery address</h3>

        <input
          placeholder="Address line"
          value={address.line1}
          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          style={{ width: "100%", padding: 10, marginTop: 8 }}
        />

        <input
          placeholder="City"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          style={{ width: "100%", padding: 10, marginTop: 8 }}
        />

        <input
          placeholder="Pincode"
          value={address.pincode}
          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          style={{ width: "100%", padding: 10, marginTop: 8 }}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Payment method</h3>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 8 }}
        >
          <option value="COD">Cash on Delivery</option>
          <option value="CARD">Card</option>
          <option value="UPI">UPI</option>
        </select>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Coupon</h3>

        <input
          placeholder="Coupon code (e.g. FRESH10)"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 8 }}
        />
      </div>

      <div className="cart-summary" style={{ marginTop: 32 }}>
        <div>
          <span>Subtotal</span>
          <strong>₹{cartTotal.toFixed(2)}</strong>
        </div>

        <div>
          <span>Delivery</span>
          <strong>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</strong>
        </div>

        <div className="cart-total">
          <span>Total</span>
          <strong>₹{total.toFixed(2)}</strong>
        </div>

        <button
          className="checkout-button"
          disabled={placing}
          onClick={placeOrder}
        >
          {placing ? "Placing order..." : "Place order →"}
        </button>
      </div>
    </div>
  );
}

// Triggers a browser download of the order invoice as PDF or Word (.docx).
async function downloadInvoice(orderId, format, token) {
  try {
    const response = await fetch(
      `${API_URL}/orders/${orderId}/invoice?format=${format}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Could not generate invoice");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freshmart-invoice-${orderId.slice(0, 8)}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert(error.message || "Could not download invoice");
  }
}

// ---------------------------------------------------------------------
// Minimal orders page — shown right after a successful checkout.
// ---------------------------------------------------------------------
function OrdersPage({ token, navigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: 720 }}>
      <button
        className="secondary-button"
        onClick={() => navigate("/")}
        style={{ marginBottom: 24 }}
      >
        ← Back to shopping
      </button>

      <h2>Your orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="cart-summary"
            style={{ marginTop: 16 }}
          >
            <div>
              <span>Order #{order.id.slice(0, 8)}</span>
              <strong>{order.status}</strong>
            </div>
            <div>
              <span>Items</span>
              <strong>{order.items.length}</strong>
            </div>
            <div className="cart-total">
              <span>Total</span>
              <strong>₹{order.total.toFixed(2)}</strong>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                className="secondary-button small"
                onClick={() => downloadInvoice(order.id, "pdf", token)}
              >
                📄 Download PDF
              </button>
              <button
                className="secondary-button small"
                onClick={() => downloadInvoice(order.id, "docx", token)}
              >
                📝 Download Word
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Admin panel — CRUD for products, users, and orders.
// Admin-only: guarded by user.role === "admin".
// ---------------------------------------------------------------------
const emptyProductForm = {
  name: "",
  brand: "",
  category: "fruits",
  price: "",
  mrp: "",
  weight: "",
  image: "",
  stock: 50,
  description: "",
  featured: false,
};

function AdminPage({ user, token, navigate }) {
  const [tab, setTab] = useState("products");

  if (!user) {
    return (
      <div className="empty-products" style={{ padding: "60px 20px" }}>
        <div>🔒</div>
        <h3>Please login</h3>
        <button className="primary-button small" onClick={() => navigate("/")}>
          Back to home
        </button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="empty-products" style={{ padding: "60px 20px" }}>
        <div>⛔</div>
        <h3>Admins only</h3>
        <p>You don't have permission to view this page.</p>
        <button className="primary-button small" onClick={() => navigate("/")}>
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: 1000 }}>
      <button
        className="secondary-button"
        onClick={() => navigate("/")}
        style={{ marginBottom: 16 }}
      >
        ← Back to shopping
      </button>

      <h2>Admin panel</h2>

      <div style={{ display: "flex", gap: 8, margin: "16px 0 24px" }}>
        {["products", "users", "orders"].map((t) => (
          <button
            key={t}
            className={t === tab ? "primary-button small" : "secondary-button"}
            onClick={() => setTab(t)}
            style={{ textTransform: "capitalize" }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "products" && <AdminProducts token={token} />}
      {tab === "users" && <AdminUsers token={token} currentUserId={user.id} />}
      {tab === "orders" && <AdminOrders token={token} />}
    </div>
  );
}

function AdminProducts({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products?limit=500`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (product) => {
    setEditingId(product.id);
    setCreating(false);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "fruits",
      price: product.price ?? "",
      mrp: product.mrp ?? "",
      weight: product.weight || "",
      image: product.image || "",
      stock: product.stock ?? 0,
      description: product.description || "",
      featured: !!product.featured,
    });
  };

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setForm(emptyProductForm);
  };

  const cancel = () => {
    setEditingId(null);
    setCreating(false);
    setForm(emptyProductForm);
  };

  const save = async () => {
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      mrp: parseFloat(form.mrp) || 0,
      stock: parseInt(form.stock, 10) || 0,
    };

    try {
      if (creating) {
        const response = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Could not create product");
      } else {
        const response = await fetch(`${API_URL}/products/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Could not update product");
      }

      cancel();
      await load();
    } catch (error) {
      alert(error.message);
    }
  };

  const remove = async (pid) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await fetch(`${API_URL}/products/${pid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
    } catch (error) {
      console.error(error);
    }
  };

  const showForm = creating || editingId;

  return (
    <div>
      {!showForm && (
        <button className="primary-button small" onClick={startCreate}>
          + Add product
        </button>
      )}

      {showForm && (
        <div
          className="cart-summary"
          style={{ marginTop: 16, marginBottom: 16 }}
        >
          <h3>{creating ? "New product" : "Edit product"}</h3>

          {[
            ["name", "Name"],
            ["brand", "Brand"],
            ["category", "Category (slug)"],
            ["price", "Price"],
            ["mrp", "MRP"],
            ["weight", "Weight"],
            ["image", "Image URL"],
            ["stock", "Stock"],
            ["description", "Description"],
          ].map(([field, label]) => (
            <input
              key={field}
              placeholder={label}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              style={{ width: "100%", padding: 10, marginTop: 8 }}
            />
          ))}

          <label
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured
          </label>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="checkout-button" onClick={save}>
              Save
            </button>
            <button className="secondary-button" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table
          style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Category</th>
              <th style={{ padding: 8 }}>Price</th>
              <th style={{ padding: 8 }}>Stock</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>{p.category}</td>
                <td style={{ padding: 8 }}>₹{p.price}</td>
                <td
                  style={{
                    padding: 8,
                    color: p.stock <= 0 ? "#ef4444" : "inherit",
                  }}
                >
                  {p.stock ?? 0}
                </td>
                <td style={{ padding: 8, display: "flex", gap: 8 }}>
                  <button
                    className="secondary-button small"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="secondary-button small"
                    onClick={() => remove(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AdminUsers({ token, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (uid, role) => {
    try {
      await fetch(`${API_URL}/admin/users/${uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      await load();
    } catch (error) {
      console.error(error);
    }
  };

  const remove = async (uid) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      const response = await fetch(`${API_URL}/admin/users/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Could not delete user");
      }
      await load();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
          <th style={{ padding: 8 }}>Name</th>
          <th style={{ padding: 8 }}>Email</th>
          <th style={{ padding: 8 }}>Role</th>
          <th style={{ padding: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <td style={{ padding: 8 }}>{u.name}</td>
            <td style={{ padding: 8 }}>{u.email}</td>
            <td style={{ padding: 8 }}>
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value)}
              >
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td style={{ padding: 8 }}>
              <button
                className="secondary-button small"
                disabled={u.id === currentUserId}
                onClick={() => remove(u.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AdminOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (oid, status) => {
    try {
      await fetch(`${API_URL}/admin/orders/${oid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (error) {
      console.error(error);
    }
  };

  const remove = async (oid) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await fetch(`${API_URL}/admin/orders/${oid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
          <th style={{ padding: 8 }}>Order</th>
          <th style={{ padding: 8 }}>Total</th>
          <th style={{ padding: 8 }}>Status</th>
          <th style={{ padding: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <td style={{ padding: 8 }}>#{o.id.slice(0, 8)}</td>
            <td style={{ padding: 8 }}>₹{o.total.toFixed(2)}</td>
            <td style={{ padding: 8 }}>
              <select
                value={o.status}
                onChange={(e) => changeStatus(o.id, e.target.value)}
              >
                <option value="confirmed">confirmed</option>
                <option value="packed">packed</option>
                <option value="out_for_delivery">out_for_delivery</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </td>
            <td style={{ padding: 8 }}>
              <button
                className="secondary-button small"
                onClick={() => remove(o.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProductCard({ product, addToCart, notifyMe }) {
  const outOfStock = (product.stock ?? 1) <= 0;

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        {product.discount > 0 && (
          <span className="discount-badge">{product.discount}% OFF</span>
        )}

        <button className="wishlist-button" aria-label="Add to wishlist">
          ♡
        </button>

        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={outOfStock ? { opacity: 0.5 } : undefined}
        />

        {outOfStock ? (
          <span className="delivery-badge" style={{ background: "#ef4444" }}>
            Out of stock
          </span>
        ) : (
          <span className="delivery-badge">
            ⚡ {product.delivery_min || 30} min
          </span>
        )}
      </div>

      <div className="product-info">
        <div className="product-brand">{product.brand || "FreshMart"}</div>

        <h3>{product.name}</h3>

        <div className="product-meta">
          <span>{product.weight || "1 unit"}</span>

          <span className="rating">★ {product.rating || "4.5"}</span>
        </div>

        <div className="product-bottom">
          <div className="price-block">
            <strong>₹{product.price}</strong>

            {product.mrp > product.price && <del>₹{product.mrp}</del>}
          </div>

          {outOfStock ? (
            <button
              className="add-button"
              onClick={() => notifyMe && notifyMe(product)}
            >
              🔔 Notify me
            </button>
          ) : (
            <button className="add-button" onClick={() => addToCart(product)}>
              <span>+</span>
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function TrustItem({ icon, title, text }) {
  return (
    <div className="trust-item">
      <div className="trust-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default App;
