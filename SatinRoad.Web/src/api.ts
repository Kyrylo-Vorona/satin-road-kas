import type { Account, Category, Product } from './types';
import type { CreateProductDto } from './generated/Api';
type Message = { message?: string };
import { Api } from './generated/Api.ts';

const api = new Api({ baseUrl: '', baseApiParams: { format: 'json' } });

async function request<T = Message>(operation: () => Promise<{ data: unknown }>): Promise<T> {
  try { return (await operation()).data as T; }
  catch (failure) {
    const response = failure as { status?: number; error?: Message };
    throw new Error(response.status === 401 ? 'Incorrect username or password.'
      : response.error?.message || 'The request failed. Check that the backend is running and try again.');
  }
}

export async function login(username: string, password: string): Promise<Account> {
  const account = await request<{ userId: number; username: string; role: 'User' | 'Admin' }>(
    () => api.api.usersLoginCreate({ username, password }),
  );
  if (
    !Number.isInteger(account?.userId) || account.userId < 1 ||
    typeof account.username !== 'string' || !account.username.trim() ||
    (account.role !== 'User' && account.role !== 'Admin')
  ) throw new Error('The server returned an invalid login response.');
  return { userId: account.userId, username: account.username, role: account.role };
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>(() => api.api.categoriesList());
}
export async function getProducts(): Promise<Product[]> {
  const products = await request<import('./generated/Api').Product[]>(() => api.api.productsList());
  return products.map((item) => ({ id: Number(item.id), name: item.name || '', price: Number(item.price), description: item.description ?? null, categoryId: item.categoryId == null ? null : Number(item.categoryId), owner: Number(item.userId), sold: item.isSold ?? false }));
}
export const createCategory = (name: string) => request(() => api.api.categoriesCreate({ name }));
export const deleteCategory = (id: number) => request(() => api.api.categoriesDelete({ id }));

function requireUser(userId: number | null): asserts userId is number {
  if (userId === null || !Number.isInteger(userId) || userId < 1) throw new Error('Please log in with your account first.');
}
export const createProduct = (data: Omit<CreateProductDto, 'userId'>, userId: number | null) => {
  requireUser(userId);
  return request(() => api.api.productsCreate({ ...data, userId }));
};
export const deleteProduct = (id: number, userId: number | null) => {
  requireUser(userId);
  return request(() => api.api.productsDelete({ id, userId }));
};
export async function buyProduct(productId: number, buyerId: number | null) {
  requireUser(buyerId);
  const result = await request(() => api.api.productsBuyCreate({ productId, buyerId }));
  return { message: `Purchase successful! ${result?.message || ''}`.trim() };
}
