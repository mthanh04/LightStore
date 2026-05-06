import api from './api';

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  _id: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
}

export interface Order {
  _id: string;
  user?: { _id: string; name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export const getAllOrders = async (
  page = 1,
  limit = 10,
  status = ''
): Promise<{ data: Order[]; pagination: any }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append('status', status);

  const res = await api.get(`/api/orders?${params.toString()}`);
  return { data: res.data.data, pagination: res.data.pagination };
};

export const updateOrderStatus = async (
  id: string,
  status: Order['status']
): Promise<Order> => {
  const res = await api.put(`/api/orders/${id}/status`, { status });
  return res.data.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/api/orders/${id}`);
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const res = await api.put(`/api/orders/${id}/cancel`);
  return res.data.data;
};
