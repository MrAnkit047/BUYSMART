import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="mt-20 border-t border-ink/8 bg-ink text-ink50">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
      <div>
        <div className="mb-3 flex items-center gap-1.5 font-display text-lg font-bold text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-xs text-inkdark">B</span>
          Buy<span className="text-teal">Smart</span>
        </div>
        <p className="text-sm text-ink50/70">
          Smart picks, honest prices. A marketplace built around good deals and fast, simple checkout.
        </p>
      </div>
      <div>
        <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Shop</h4>
        <ul className="space-y-2 text-sm text-ink50/80">
          <li><Link to="/products" className="hover:text-white">All products</Link></li>
          <li><Link to="/products?sort=newest" className="hover:text-white">New arrivals</Link></li>
          <li><Link to="/products?category=Electronics" className="hover:text-white">Electronics</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Account</h4>
        <ul className="space-y-2 text-sm text-ink50/80">
          <li><Link to="/profile" className="hover:text-white">My profile</Link></li>
          <li><Link to="/orders" className="hover:text-white">Order history</Link></li>
          <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Support</h4>
        <ul className="space-y-2 text-sm text-ink50/80">
          <li>hello@buysmart.example</li>
          <li>Mon–Fri, 9am–6pm</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 px-4 py-4 text-center font-mono text-xs text-ink50/50 sm:px-6">
      © {new Date().getFullYear()} BuySmart. Built for demonstration purposes.
    </div>
  </footer>
);

export default Footer;
