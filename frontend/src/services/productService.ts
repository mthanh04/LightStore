import api from './api';

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Specification {
  key: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: ProductCategory | string;
  stock: number;
  images: string[];
  // Chi tiết sản phẩm
  brand?: string;
  specifications?: Specification[];
  warranty?: string;
  usage?: string;
  importantInfo?: string;
  weight?: string;
  dimensions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}

interface ProductsResponse {
  status: string;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

interface ProductResponse {
  status: string;
  data: Product;
}

// GET /api/products
export const getProducts = async (
  query: ProductQuery = {}
): Promise<{ data: Product[]; pagination: ProductsResponse['pagination'] }> => {
  const params = new URLSearchParams();
  if (query.page)     params.set('page',     String(query.page));
  if (query.limit)    params.set('limit',    String(query.limit));
  if (query.search)   params.set('search',   query.search);
  if (query.category) params.set('category', query.category);
  if (query.sort)     params.set('sort',     query.sort);

  const res = await api.get<ProductsResponse>(`/api/products?${params.toString()}`);
  return { data: res.data.data, pagination: res.data.pagination };
};

// POST /api/products — multipart/form-data (images field, max 10 files)
export const createProduct = async (formData: FormData): Promise<Product> => {
  const res = await api.post<ProductResponse>('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

// PUT /api/products/:id — multipart/form-data (appends new images)
export const updateProduct = async (id: string, formData: FormData): Promise<Product> => {
  const res = await api.put<ProductResponse>(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

// DELETE /api/products/:id
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/api/products/${id}`);
};

// GET /api/products/:id — chi tiết 1 sản phẩm
export const getProductById = async (id: string): Promise<Product> => {
  const res = await api.get<ProductResponse>(`/api/products/${id}`);
  return res.data.data;
};

// GET /api/products/:id/related — sản phẩm liên quan
export const getRelatedProducts = async (id: string): Promise<Product[]> => {
  const res = await api.get<{ status: string; data: Product[] }>(`/api/products/${id}/related`);
  return res.data.data;
};

