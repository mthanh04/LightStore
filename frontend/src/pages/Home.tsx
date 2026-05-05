import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import LogoBulb from '../components/ui/LogoBulb';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navbar */}
      <header className="bg-[#FAFAFA] border-b border-[#E5E5E5] shadow-subtle sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <LogoBulb size={36} interval={2500} duration={700} />
            <span
              className="text-xl font-extrabold text-[#171717]"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              LightStore
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="secondary" size="sm">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 text-[#525252]">
                  <UserCircleIcon className="w-5 h-5 text-[#D946EF]" />
                  <span className="text-[14px] font-[600]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-[13px] text-[#525252] hover:text-[#EF4444] transition-colors cursor-pointer"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(217,70,239,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(34,211,238,0.06) 0%, transparent 60%)',
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#FDF4FF] border border-[#F5D0FE] rounded-full px-4 py-1.5 mb-6">
            <SparklesIcon className="w-4 h-4 text-[#D946EF]" />
            <span
              className="text-[12px] font-[700] text-[#D946EF] uppercase tracking-widest"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              New Collection 2026
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl font-extrabold text-[#171717] leading-tight mb-6"
            style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.02em' }}
          >
            Thắp sáng không gian{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #D946EF, #22D3EE)' }}
            >
              của bạn
            </span>
          </h1>

          <p
            className="text-lg text-[#525252] max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Khám phá bộ sưu tập đèn chiếu sáng cao cấp — thiết kế hiện đại, tiết kiệm năng lượng,
            phù hợp cho mọi không gian sống và làm việc.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              variant="primary"
              size="lg"
              className="btn-pulse"
              onClick={() => {}}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Mua sắm ngay
            </Button>
            <Button variant="secondary" size="lg">
              Xem bộ sưu tập
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold text-[#171717] text-center mb-12"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Vì sao chọn LightStore?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: '⚡',
                title: 'Giao hàng nhanh',
                desc: 'Nhận hàng trong 24h tại nội thành, toàn quốc trong 3 ngày.',
                accent: '#D946EF',
                bg: '#FDF4FF',
              },
              {
                emoji: '🌿',
                title: 'Thân thiện môi trường',
                desc: 'Tất cả sản phẩm đều đạt chứng chỉ tiết kiệm năng lượng Energy Star.',
                accent: '#22C55E',
                bg: '#F0FDF4',
              },
              {
                emoji: '🛡️',
                title: 'Bảo hành 2 năm',
                desc: 'Cam kết bảo hành toàn bộ sản phẩm, đổi trả miễn phí trong 30 ngày.',
                accent: '#22D3EE',
                bg: '#F0FDFE',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-[16px] p-6 border border-[#E5E5E5] shadow-subtle hover:shadow-medium transition-all duration-200 hover:-translate-y-1 cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: f.bg }}
                >
                  {f.emoji}
                </div>
                <h3
                  className="text-[18px] font-bold text-[#171717] mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-[14px] text-[#525252] leading-relaxed"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
