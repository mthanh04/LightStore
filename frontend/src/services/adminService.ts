import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface AdminStats {
  // Stat cards
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueTrend: number;
  ordersTrend: number;
  usersTrend: number;
  // Charts
  ordersByStatus: {
    Delivered: number;
    Shipped: number;
    Pending: number;
    Cancelled: number;
    Processing: number;
  };
  dailyRevenue: { date: string; revenue: number }[];
  monthlyRevenue: { month: string; current: number; prev: number }[];
  revenueByCategory: { name: string; revenue: number }[];
  topProducts: { _id: string; name: string; image: string; quantity: number; revenue: number }[];
  recentUsers: { _id: string; name: string; email: string; createdAt: string }[];
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
