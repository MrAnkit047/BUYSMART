import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const PublicNavbar = () => {
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
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-1.5 font-display text-xl font-bold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-sm text-accent">B</span>
          Buy<span className="text-teal">Smart</span>
          <span className="ml-1 hidden rounded bg-ink50 px-1.5 py-0.5 font-mono text-[9px] font-normal uppercase tracking-wider text-ink/50 sm:inline">
            Nepal
          </span>
        </Link>

        <form onSubmit={handleSearch} className="mx-2 hidden flex-1 items-center md:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search products in NPR…"
            className="w-full rounded-l-lg border border-ink/15 bg-surface px-4 py-2 text-sm outline-none focus:border-teal"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-teal"
          >
            Search
          </button>
        </form>

        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-ink/80 md:flex">
          <Link to="/products" className="hover:text-teal">Shop</Link>
          {user ? (
            <Link to="/account" className="hover:text-teal">
              My account
            </Link>
          ) : (
            <>
              <Link to="/login" className="hover:text-teal">Log in</Link>
              <Link to="/register" className="rounded-lg border border-teal px-3 py-1.5 text-teal hover:bg-teal hover:text-white">
                Register
              </Link>
            </>
          )}
          <Link to="/cart" className="relative flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-white hover:bg-teal">
            Cart
            {itemsCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[11px] font-bold text-inkdark">
                {itemsCount}
              </span>
            )}
          </Link>
        </nav>

        <button
          className="ml-auto rounded-md p-2 text-ink md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-ink/8 bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products…"
              className="w-full rounded-l-lg border border-ink/15 px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="rounded-r-lg bg-ink px-3 py-2 text-sm text-white">Go</button>
          </form>
          <div className="flex flex-col gap-1 text-sm">
            <Link to="/products" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-ink50">Shop</Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-ink50">Cart ({itemsCount})</Link>
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-ink50">My account</Link>
                <button onClick={handleLogout} className="rounded-md px-2 py-2 text-left hover:bg-ink50">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-ink50">Log in</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 hover:bg-ink50">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
