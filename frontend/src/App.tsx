import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────── */}
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Admin-only routes (nested) ────────────────── */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"            element={<AdminDashboard />} />
          <Route path="/admin/products"   element={<Products />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/orders"     element={<Orders />} />
          <Route path="/admin/users"      element={<Users />} />
        </Route>
      </Route>

      {/* ── Fallback ──────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
