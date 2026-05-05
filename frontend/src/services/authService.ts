import api from './api';

export interface AuthResponse {
  status: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    token: string;
  };
}

export interface UserResponse {
  status: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
}

// POST /api/auth/login
export const loginApi = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
  return res.data;
};

// POST /api/auth/register
export const registerApi = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/auth/register', { name, email, password });
  return res.data;
};

// GET /api/auth/me
export const getMeApi = async (): Promise<UserResponse> => {
  const res = await api.get<UserResponse>('/api/auth/me');
  return res.data;
};
