import { create } from 'zustand';
import { loginApi, registerApi, getMeApi, updateProfileApi } from '../services/authService';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

const LS_TOKEN_KEY = 'ls_token';
const LS_USER_KEY  = 'ls_user';

// Đọc user/token từ localStorage khi khởi tạo store
const savedToken = localStorage.getItem(LS_TOKEN_KEY);
const savedUser: User | null = (() => {
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create<AuthState>((set) => ({
  user:            savedUser,
  token:           savedToken,
  isAuthenticated: !!savedToken && !!savedUser,
  isLoading:       false,
  error:           null,

  // ─── Login ────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginApi(email, password);
      const { token, ...user } = res.data;

      localStorage.setItem(LS_TOKEN_KEY, token);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng thử lại.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ─── Register ─────────────────────────────────────────
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await registerApi(name, email, password);
      const { token, ...user } = res.data;

      localStorage.setItem(LS_TOKEN_KEY, token);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ─── Update Profile ─────────────────────────────────────
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updateProfileApi(data);
      const user = res.data as User;
      
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Cập nhật thất bại. Vui lòng thử lại.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ─── Logout ───────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_USER_KEY);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  // ─── Fetch current user (verify token still valid) ────
  fetchUser: async () => {
    const token = localStorage.getItem(LS_TOKEN_KEY);
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await getMeApi();
      const user = res.data as User;
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_USER_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  // ─── Clear error ──────────────────────────────────────
  clearError: () => set({ error: null }),
}));
