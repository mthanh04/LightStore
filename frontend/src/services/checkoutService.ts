import api from './api';
import type { Order } from './orderService';

export interface CheckoutPayload {
  orderItems: {
    product: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
  };
}

interface OrderResponse {
  status: string;
  data: Order;
}

interface MyOrdersResponse {
  status: string;
  data: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

// POST /api/orders — tạo đơn hàng mới
export const createOrder = async (payload: CheckoutPayload): Promise<Order> => {
  const res = await api.post<OrderResponse>('/api/orders', payload);
  return res.data.data;
};

// GET /api/orders/myorders — đơn hàng của user hiện tại
export const getMyOrders = async (
  page = 1,
  limit = 10
): Promise<{ data: Order[]; pagination: MyOrdersResponse['pagination'] }> => {
  const res = await api.get<MyOrdersResponse>(
    `/api/orders/myorders?page=${page}&limit=${limit}`
  );
  return { data: res.data.data, pagination: res.data.pagination };
};
