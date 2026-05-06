import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import LogoBulb from '../ui/LogoBulb';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems, openDrawer } = useCartStore();

  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/shop', label: 'Cửa hàng' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="bg-white border-b border-[#E5E5E5] shadow-subtle sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <LogoBulb size={34} interval={2500} duration={700} />
          <span
            className="text-[20px] font-[800] text-[#171717] hidden sm:block"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            LightStore
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-full text-[14px] font-[600] transition-all duration-200 ${
                isActive(link.to)
                  ? 'bg-[#FDF4FF] text-[#D946EF]'
                  : 'text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717]'
              }`}
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search bar — desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xs items-center"
        >
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full h-[40px] pl-9 pr-4 border border-[#D4D4D4] rounded-full text-[14px] text-[#171717] placeholder-[#A3A3A3] bg-[#FAFAFA] focus:outline-none focus:border-[#D946EF] focus:ring-2 focus:ring-[#D946EF]/15 transition-all"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <button
            onClick={openDrawer}
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[#525252] hover:text-[#D946EF] transition-colors cursor-pointer"
          >
            <ShoppingBagIcon className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#D946EF] text-white text-[10px] font-[800] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF4FF] text-[#D946EF] text-[13px] font-[600] hover:bg-[#FAE8FF] transition-colors"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-[13px] text-[#525252] hover:text-[#171717] font-[600] transition-colors px-2 py-1.5 rounded-full hover:bg-[#F5F5F5]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <UserCircleIcon className="w-5 h-5 text-[#D946EF]" />
                  {user.name.split(' ').pop()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[13px] text-[#A3A3A3] hover:text-[#EF4444] transition-colors cursor-pointer px-2 py-1.5 rounded-full hover:bg-[#FEE2E2]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-[14px] font-[600] text-[#525252] hover:bg-[#F5F5F5] transition-colors"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-[14px] font-[700] bg-[#D946EF] text-white hover:bg-[#C026D3] transition-colors shadow-medium"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[#525252] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96 border-t border-[#E5E5E5]' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-white">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full h-[40px] pl-9 pr-4 border border-[#D4D4D4] rounded-full text-[14px] placeholder-[#A3A3A3] focus:outline-none focus:border-[#D946EF]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>
          </form>

          {/* Auth links mobile */}
          {isAuthenticated && user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[14px] text-[#525252] hover:bg-[#F5F5F5] rounded-[8px] transition-colors"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <UserCircleIcon className="w-5 h-5 text-[#D946EF]" />
                Xin chào, <span className="font-[700] text-[#171717]">{user.name}</span>
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-[14px] font-[600] text-[#D946EF] hover:bg-[#FDF4FF]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[14px] font-[600] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 h-[40px] flex items-center justify-center rounded-full border-2 border-[#D946EF] text-[#D946EF] text-[14px] font-[700]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 h-[40px] flex items-center justify-center rounded-full bg-[#D946EF] text-white text-[14px] font-[700]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
