import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import PriceTag from "../components/PriceTag.jsx";
import Loader from "../components/Loader.jsx";
import Message from "../components/Message.jsx";

const categoryBlurb = {
  Electronics: "Mobiles, Laptops & Tech",
  Fashion: "Yak Wool, Pashmina & Wear",
  "Home & Living": "Pressure Cookers & Decor",
  "Sports & Outdoors": "Everest Trek Gear & Shoes",
  "Groceries & Gourmet": "Himalayan Tea & Flavors",
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: featuredData }, { data: catData }] = await Promise.all([
          api.get("/products/featured"),
          api.get("/products/categories"),
        ]);
        setFeatured(featuredData);
        setCategories(catData);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load catalog");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-ink py-16 sm:py-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <PriceTag tone="accent">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> NPR Deals Across Nepal
              </span>
            </PriceTag>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Shop Smarter.
              <br />
              <span className="text-accent">Transparent Prices.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-ink50/80 leading-relaxed">
              BuySmart offers verified electronics, apparel, and home essentials with authentic Nepalese Rupee (NPR) pricing — direct to your doorstep across Nepal.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-inkdark transition hover:bg-accentdark shadow-lg shadow-accent/10"
              >
                Browse Catalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?sort=price_asc"
                className="flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:border-teal hover:text-teal"
              >
                Best Budget Deals
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden items-center justify-center md:flex"
          >
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((p) => (
                <Link
                  key={p._id}
                  to={`/products/${p.slug || p._id}`}
                  className="group relative h-40 w-40 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-xl backdrop-blur"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover rounded-xl transition duration-500 group-hover:scale-110"
                  />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Bar */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-teal">Browse By Department</span>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">Popular Categories</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 transition hover:border-teal hover:shadow-lg hover:shadow-teal/5"
              >
                <div>
                  <span className="font-display text-base font-semibold text-ink group-hover:text-teal">
                    {cat}
                  </span>
                  <p className="mt-1 text-xs text-ink/50 leading-snug">
                    {categoryBlurb[cat] || "Curated NPR selection"}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal group-hover:underline">
                  Shop category <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Deals */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-teal">Handpicked Selection</span>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">Featured Deals in NPR</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-teal hover:underline flex items-center gap-1">
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading && <Loader label="Loading featured deals" />}
        {error && <Message type="error">{error}</Message>}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Features Strip */}
      <section className="border-t border-ink/8 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-4 rounded-2xl border border-ink/8 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Fast Delivery Across Nepal</h3>
                <p className="mt-1 text-xs text-ink/60">Delivered directly to Kathmandu, Pokhara, Chitwan and beyond.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-ink/8 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Transparent NPR Pricing</h3>
                <p className="mt-1 text-xs text-ink/60">No hidden conversion fees or surprise charges at checkout.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-ink/8 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-ink">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Verified Customer Support</h3>
                <p className="mt-1 text-xs text-ink/60">Track your order with your Customer ID right from your portal.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
