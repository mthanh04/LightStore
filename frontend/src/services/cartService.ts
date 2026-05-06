import api from './api';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
}

export const getCartApi = async (): Promise<CartItem[]> => {
  const res = await api.get('/api/cart');
  return res.data.data;
};

export const syncCartApi = async (items: { _id: string; quantity: number }[]): Promise<CartItem[]> => {
  const res = await api.post('/api/cart/sync', { items });
  return res.data.data;
};

export const addToCartApi = async (productId: string, quantity: number): Promise<CartItem[]> => {
  const res = await api.post('/api/cart', { productId, quantity });
  return res.data.data;
};

export const updateCartItemApi = async (productId: string, quantity: number): Promise<CartItem[]> => {
  const res = await api.put(`/api/cart/${productId}`, { quantity });
  return res.data.data;
};

export const removeCartItemApi = async (productId: string): Promise<CartItem[]> => {
  const res = await api.delete(`/api/cart/${productId}`);
  return res.data.data;
};

export const clearCartApi = async (): Promise<CartItem[]> => {
  const res = await api.delete('/api/cart');
  return res.data.data;
};
