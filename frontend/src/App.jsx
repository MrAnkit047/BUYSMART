import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import PublicLayout from "./layouts/PublicLayout.jsx";
import UserLayout from "./layouts/UserLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

import Home from "./pages/Home.jsx";
import ProductList from "./pages/ProductList.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import PaymentVerify from "./pages/PaymentVerify.jsx";
import Profile from "./pages/Profile.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

import UserDashboard from "./pages/account/UserDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminProductEdit from "./pages/admin/AdminProductEdit.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminCustomers from "./pages/admin/AdminCustomers.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";

function App() {
  return (
    <Routes>
      {/* Public & Customer Shopping Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />

        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>
      </Route>

      {/* Customer Portal Account Interface */}
      <Route element={<PrivateRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/account" element={<UserDashboard />} />
          <Route path="/account/orders" element={<Orders />} />
          <Route path="/account/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Portal Interface */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<AdminProductEdit />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
