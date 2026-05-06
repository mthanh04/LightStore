import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LogoBulb from '../components/ui/LogoBulb';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, isAuthenticated, user, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [shakeError, setShakeError] = useState(false);

  // Nếu đã đăng nhập → phân hướng ngay
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => () => clearError(), [clearError]);

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!name.trim()) errors.name = 'Vui lòng nhập họ tên';
    else if (name.trim().length < 2) errors.name = 'Tên ít nhất 2 ký tự';

    if (!email) errors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';

    if (!password) errors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) errors.password = 'Mật khẩu ít nhất 6 ký tự';

    if (!confirm) errors.confirm = 'Vui lòng xác nhận mật khẩu';
    else if (confirm !== password) errors.confirm = 'Mật khẩu không khớp';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(name.trim(), email, password);
    } catch {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  };

  // Password strength indicator
  const getStrength = (): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: '' };
    if (password.length < 6)  return { level: 1, label: 'Yếu',    color: '#EF4444' };
    if (password.length < 10) return { level: 2, label: 'Trung bình', color: '#F59E0B' };
    return { level: 3, label: 'Mạnh', color: '#22C55E' };
  };
  const strength = getStrength();

  return (
    <div className="min-h-screen auth-gradient auth-gradient-overlay flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-[-60px] right-[-80px] w-[300px] h-[300px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #D946EF, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[-80px] left-[-60px] w-[280px] h-[280px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #FACC15, transparent 70%)' }}
      />

      <div className="w-full max-w-[460px] animate-slide-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <LogoBulb size={42} interval={2500} duration={700} />
            <span
              className="text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Roboto, sans-serif', color: '#171717' }}
            >
              LightStore
            </span>
          </div>
          <h1
            className="text-3xl font-bold text-[#171717] mb-1"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Tạo tài khoản
          </h1>
          <p className="text-[#525252] text-[15px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Tham gia LightStore và khám phá thế giới ánh sáng
          </p>
        </div>

        {/* Card */}
        <div className="auth-card p-8">
          {/* API Error */}
          {error && (
            <div
              className={`mb-5 flex items-start gap-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[12px] px-4 py-3 ${shakeError ? 'animate-shake' : ''}`}
            >
              <svg className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-[#991B1B] text-[13px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="register-name"
              label="Họ và tên"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
              error={fieldErrors.name}
              leftIcon={<UserIcon className="w-5 h-5" />}
              autoComplete="name"
            />

            <Input
              id="register-email"
              label="Email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
              error={fieldErrors.email}
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              autoComplete="email"
            />

            <div>
              <Input
                id="register-password"
                label="Mật khẩu"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                error={fieldErrors.password}
                leftIcon={<LockClosedIcon className="w-5 h-5" />}
                autoComplete="new-password"
              />
              {/* Strength bar */}
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i <= strength.level ? strength.color : '#E5E5E5',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[11px] font-[600] shrink-0"
                    style={{ color: strength.color, fontFamily: 'Roboto, sans-serif' }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <Input
              id="register-confirm"
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setFieldErrors((p) => ({ ...p, confirm: undefined })); }}
              error={fieldErrors.confirm}
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              id="btn-register-submit"
            >
              {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E5E5E5]" />
            <span className="text-[#A3A3A3] text-[13px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              hoặc
            </span>
            <div className="flex-1 h-px bg-[#E5E5E5]" />
          </div>

          <p className="text-center text-[14px] text-[#525252]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[#D946EF] font-[700] hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-[12px] text-[#A3A3A3] mt-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <a href="#" className="text-[#D946EF] hover:underline">Điều khoản dịch vụ</a>{' '}
          và{' '}
          <a href="#" className="text-[#D946EF] hover:underline">Chính sách bảo mật</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
