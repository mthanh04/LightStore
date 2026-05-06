import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  Squares2X2Icon,
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import LogoBulb from '../components/ui/LogoBulb';

const NAV_ITEMS = [
  { to: '/admin',            label: 'Tổng quan',    icon: Squares2X2Icon, end: true },
  { to: '/admin/products',   label: 'Sản phẩm',     icon: CubeIcon },
  { to: '/admin/categories', label: 'Danh mục',     icon: TagIcon },
  { to: '/admin/orders',     label: 'Đơn hàng',     icon: ShoppingCartIcon },
  { to: '/admin/users',      label: 'Người dùng',   icon: UsersIcon },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <LogoBulb size={32} interval={2500} duration={700} />
        <div>
          <p className="text-white font-bold text-[16px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            LightStore
          </p>
          <span className="text-[10px] font-semibold text-[#FFDA1A] uppercase tracking-widest">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-[14px] font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#FFDA1A] text-[#111111]'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`
            }
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#FFDA1A] flex items-center justify-center text-[#003399] font-bold text-[13px]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {user?.name}
            </p>
            <p className="text-white/50 text-[11px] truncate">{user?.email}</p>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-[4px] text-[13px] transition-colors"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <Squares2X2Icon className="w-4 h-4" />
          Xem trang chủ
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-white/60 hover:text-red-300 hover:bg-white/10 rounded-[4px] text-[13px] transition-colors cursor-pointer"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden">
      {/* ── Desktop Sidebar (240px) ─────────────────────── */}
      <aside className="hidden md:flex flex-col w-[240px] shrink-0 bg-[#003399]">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-[#003399] flex flex-col transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex md:hidden items-center gap-3 px-4 h-14 bg-[#003399] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white cursor-pointer"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <span className="text-white font-bold text-[15px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            LightStore Admin
          </span>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
