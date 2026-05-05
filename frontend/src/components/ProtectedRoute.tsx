import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  /** Nếu truyền requiredRole thì chỉ role đó mới vào được */
  requiredRole?: 'user' | 'admin';
  /** Đường dẫn chuyển hướng khi không đủ quyền */
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user } = useAuthStore();

  // Chưa đăng nhập → về login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Có yêu cầu role cụ thể nhưng không khớp → 403 về trang chủ
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
