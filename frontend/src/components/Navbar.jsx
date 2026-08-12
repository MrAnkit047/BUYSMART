import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, LogOut, ShieldCheck, UserCheck, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/products?keyword=${encodeURIComponent(query.trim())}` : "/products");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-base font-bold text-accent shadow-sm">
            B
          </span>
          Buy<span className="text-teal">Smart</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-4 hidden flex-1 items-center md:flex max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products in NPR, electronics, fashion..."
              className="w-full rounded-xl border border-ink/15 bg-white pl-9 pr-20 py-2 text-sm outline-none transition focus:border-teal"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 rounded-lg bg-ink px-3 text-xs font-semibold text-white transition hover:bg-teal"
            >
              Search
            </button>
          </div>
        </form>

        {/* Navigation Items */}
        <nav className="ml-auto hidden items-center gap-5 text-sm font-semibold text-ink/80 md:flex">
          <Link to="/products" className="transition hover:text-teal">
            Storefront
          </Link>

          {user?.isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-lg bg-inkdark px-3 py-1.5 text-xs text-accent transition hover:bg-ink"
            >
              <ShieldCheck className="h-4 w-4" /> Admin Console
            </Link>
          )}

          {user ? (
            <div className="group relative">
              <Link
                to="/account"
                className="flex items-center gap-1.5 text-ink transition hover:text-teal"
              >
                <UserCheck className="h-4 w-4 text-teal" />
                <span>Hi, {user.name.split(" ")[0]}</span>
              </Link>
              <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-xl border border-ink/10 bg-white p-2 shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="px-3 py-2 border-b border-ink/8">
                  <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                  {user.customerId && (
                    <p className="font-mono text-[10px] text-teal font-semibold">ID: {user.customerId}</p>
                  )}
                </div>
                <Link
                  to="/account"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-ink transition hover:bg-ink50"
                >
                  <User className="h-3.5 w-3.5" /> Customer Dashboard
                </Link>
                <Link
                  to="/account/orders"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-ink transition hover:bg-ink50"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="transition hover:text-teal">
              Log In
            </Link>
          )}

          {/* Cart Icon with Pop Animation */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" /> Cart
            <AnimatePresence>
              {itemsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[11px] font-bold text-inkdark"
                >
                  {itemsCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="ml-auto rounded-xl p-2 text-ink hover:bg-ink/5 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-ink/8 bg-white px-4 py-4 md:hidden shadow-lg"
        >
          <form onSubmit={handleSearch} className="mb-4 flex">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="w-full rounded-l-xl border border-ink/15 px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="rounded-r-xl bg-ink px-4 py-2 text-sm text-white font-semibold">
              Go
            </button>
          </form>
          <div className="flex flex-col gap-2 text-sm font-semibold">
            <Link to="/products" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-ink50">
              Browse Storefront
            </Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-ink50 flex justify-between items-center">
              <span>Shopping Cart</span>
              <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-xs text-inkdark">{itemsCount}</span>
            </Link>
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-ink50">
                  Customer Dashboard ({user.customerId || "Profile"})
                </Link>
                <Link to="/account/orders" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-ink50">
                  My Orders
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 bg-inkdark text-accent">
                    Admin Portal
                  </Link>
                )}
                <button onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-left text-red-600 hover:bg-red-50">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-ink50">
                  Log In
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 bg-ink text-white text-center">
                  Register Account
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
