import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: { _id: string; name: string; stock: number; price: number }[];
}

export const getUsers = async (
  page = 1,
  limit = 10,
  search = '',
  role = ''
): Promise<{ data: User[]; pagination: any }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (role) params.append('role', role);

  const res = await api.get(`/api/admin/users?${params.toString()}`);
  return { data: res.data.data, pagination: res.data.pagination };
};

export const updateUserRole = async (id: string, role: 'admin' | 'user'): Promise<User> => {
  const res = await api.put(`/api/admin/users/${id}`, { role });
  return res.data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/users/${id}`);
};

export const getDashboardStats = async (): Promise<AdminStats> => {
  const res = await api.get('/api/admin/dashboard');
  return res.data.data;
};
