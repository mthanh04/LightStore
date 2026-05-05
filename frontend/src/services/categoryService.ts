import api from './api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoriesResponse {
  status: string;
  results: number;
  data: Category[];
}

interface CategoryResponse {
  status: string;
  data: Category;
}

// GET /api/categories
export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get<CategoriesResponse>('/api/categories');
  return res.data.data;
};

// POST /api/categories (Admin)
export const createCategory = async (name: string): Promise<Category> => {
  const res = await api.post<CategoryResponse>('/api/categories', { name });
  return res.data.data;
};

// PUT /api/categories/:id (Admin)
export const updateCategory = async (id: string, name: string): Promise<Category> => {
  const res = await api.put<CategoryResponse>(`/api/categories/${id}`, { name });
  return res.data.data;
};

// DELETE /api/categories/:id (Admin)
export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/api/categories/${id}`);
};
