import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public User Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';

// Protected User Pages
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import Categories from './pages/Admin/Categories';
import Products from './pages/Admin/Products';
import Orders from './pages/Admin/Orders';
import Users from './pages/Admin/Users';

// Auth Guard
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* ── User routes (wrapped in MainLayout) ─────────── */}
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Protected (User or Admin can access) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ── Auth routes (no layout) ─────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Admin-only routes (wrapped in AdminLayout) ──── */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Route>

      {/* ── Fallback ──────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
