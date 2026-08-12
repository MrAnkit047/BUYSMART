import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Message from "../../components/Message.jsx";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users")
      .then(({ data }) => setCustomers(data.filter((u) => !u.isAdmin)))
      .catch((err) => setError(err.response?.data?.message || "Could not load customers"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading customers" />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Customers</h1>
      <p className="mt-1 text-sm text-white/50">Registered shoppers with unique customer IDs.</p>

      {error && <div className="mt-4"><Message type="error">{error}</Message></div>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-ink">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 font-mono text-xs uppercase tracking-widest text-white/40">
            <tr>
              <th className="px-4 py-3">Customer ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/40">No customers registered yet.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-accent">{c.customerId || "—"}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3 text-white/50">{new Date(c.createdAt).toLocaleDateString("en-NP")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
