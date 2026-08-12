import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, User, ArrowLeft, LogOut, IdCard } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
    isActive ? "bg-teal/10 text-teal" : "text-ink/70 hover:bg-ink50 hover:text-ink"
  }`;

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-ink/8 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/account" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-sm font-bold text-accent">BS</span>
            Customer Account Portal
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="flex items-center gap-1 text-ink/60 transition hover:text-teal">
              <ArrowLeft className="h-4 w-4" /> Storefront
            </Link>
            <span className="hidden text-ink/40 sm:inline">|</span>
            <span className="hidden font-semibold text-ink sm:inline">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-ink/8 bg-white p-4 shadow-sm">
          {user?.customerId && (
            <div className="mb-4 rounded-xl bg-ink50 p-3">
              <div className="flex items-center gap-1.5 text-teal">
                <IdCard className="h-4 w-4" />
                <p className="font-mono text-[10px] uppercase tracking-widest font-bold">User / Customer ID</p>
              </div>
              <p className="mt-1 font-mono text-sm font-bold text-ink">{user.customerId}</p>
            </div>
          )}
          <nav className="flex flex-col gap-1">
            <NavLink to="/account" end className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/account/orders" className={navLinkClass}>
              <ShoppingBag className="h-4 w-4" /> My Orders
            </NavLink>
            <NavLink to="/account/profile" className={navLinkClass}>
              <User className="h-4 w-4" /> Profile & Address
            </NavLink>
            <button
              onClick={handleLogout}
              className="mt-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
