import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader label="Checking session" />;
  return user?.isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
