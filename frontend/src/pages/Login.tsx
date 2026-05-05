import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LogoBulb from '../components/ui/LogoBulb';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, user, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [shakeError, setShakeError] = useState(false);

  // Nếu đã đăng nhập → phân hướng ngay
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Xóa error store khi unmount
  useEffect(() => () => clearError(), [clearError]);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';
    if (!password) errors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) errors.password = 'Mật khẩu ít nhất 6 ký tự';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
    } catch {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  };

  return (
    <div className="min-h-screen auth-gradient auth-gradient-overlay flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #D946EF, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #22D3EE, transparent 70%)' }}
      />

      <div className="w-full max-w-[440px] animate-slide-up">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <LogoBulb size={42} interval={2500} duration={700} />
            <span
              className="text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Poppins, sans-serif', color: '#171717' }}
            >
              LightStore
            </span>
          </div>
          <h1
            className="text-3xl font-bold text-[#171717] mb-1"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Chào mừng trở lại!
          </h1>
          <p className="text-[#525252] text-[15px]" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Đăng nhập để tiếp tục mua sắm
          </p>
        </div>

        {/* Card */}
        <div className="auth-card p-8">
          {/* API Error Banner */}
          {error && (
            <div
              className={`mb-5 flex items-start gap-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[12px] px-4 py-3 ${shakeError ? 'animate-shake' : ''}`}
            >
              <svg className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-[#991B1B] text-[13px]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input
              id="login-email"
              label="Email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
              error={fieldErrors.email}
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              autoComplete="email"
            />

            <Input
              id="login-password"
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
              error={fieldErrors.password}
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <a
                href="#"
                className="text-[13px] text-[#D946EF] hover:underline"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Quên mật khẩu?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-1"
              id="btn-login-submit"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E5E5E5]" />
            <span className="text-[#A3A3A3] text-[13px]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              hoặc
            </span>
            <div className="flex-1 h-px bg-[#E5E5E5]" />
          </div>

          <p className="text-center text-[14px] text-[#525252]" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-[#D946EF] font-[700] hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
