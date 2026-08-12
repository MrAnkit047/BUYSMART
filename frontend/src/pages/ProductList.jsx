import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";
import Message from "../components/Message.jsx";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { page, sort };
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        const { data } = await api.get("/products", { params });
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [keyword, category, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {keyword ? `Results for "${keyword}"` : category || "All products"}
          </h1>
          <p className="text-sm text-ink/50">{data.total} product{data.total !== 1 ? "s" : ""} found</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-teal"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-teal"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      {loading && <Loader label="Fetching products" />}
      {error && <Message type="error">{error}</Message>}

      {!loading && !error && data.products.length === 0 && (
        <Message type="info">No products match your search. Try a different keyword or category.</Message>
      )}

      {!loading && !error && data.products.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", p);
                    setSearchParams(next);
                  }}
                  className={`h-9 w-9 rounded-lg font-mono text-sm ${
                    p === data.page ? "bg-ink text-white" : "border border-ink/15 text-ink/70 hover:border-teal"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;
