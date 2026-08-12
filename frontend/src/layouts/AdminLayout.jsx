import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, Store, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
    isActive ? "bg-accent/15 text-accent" : "text-white/60 hover:bg-white/5 hover:text-white"
  }`;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-inkdark">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink lg:flex">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <Link to="/admin" className="font-display text-xl font-bold text-white">
              Buy<span className="text-accent">Smart</span>
            </Link>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40">
            Administrative Console
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClass}>
            <Package className="h-4 w-4" /> Products & Pricing
          </NavLink>
          <NavLink to="/admin/orders" className={navLinkClass}>
            <ShoppingBag className="h-4 w-4" /> Customer Orders
          </NavLink>
          <NavLink to="/admin/customers" className={navLinkClass}>
            <Users className="h-4 w-4" /> Registered Users
          </NavLink>
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-xs font-semibold text-white/70">{user?.email}</p>
          <Link to="/" className="mt-2 flex items-center gap-1.5 text-xs text-teal hover:underline font-medium">
            <Store className="h-3.5 w-3.5" /> Open Public Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-400 transition hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-ink px-4 py-3 lg:hidden">
          <Link to="/admin" className="font-display font-bold text-white flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-accent" /> Admin Panel
          </Link>
          <div className="flex gap-4 text-xs font-semibold">
            <Link to="/admin/products" className="text-white/80 hover:text-accent">Products</Link>
            <Link to="/admin/orders" className="text-white/80 hover:text-accent">Orders</Link>
            <Link to="/admin/customers" className="text-white/80 hover:text-accent">Users</Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
