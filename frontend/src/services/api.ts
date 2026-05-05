import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────
// Tự động đính kèm token vào mọi request nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ls_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────
// Xử lý lỗi 401 tập trung: token hết hạn → xóa và chuyển về login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ls_token');
      localStorage.removeItem('ls_user');
      // Tránh redirect loop nếu đã ở trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
