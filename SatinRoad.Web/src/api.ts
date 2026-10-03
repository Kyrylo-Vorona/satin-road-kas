import type { Account, Category, Product } from './types';
import type { CreateProductDto } from './generated/Api';
type Message = { message?: string };
import { Api } from './generated/Api.ts';

const api = new Api({ baseUrl: '', baseApiParams: { format: 'json', credentials: 'same-origin' } });

async function request<T = Message>(operation: () => Promise<{ data: unknown }>, loginAttempt = false): Promise<T> {
  try { return (await operation()).data as T; }
  catch (failure) {
    const response = failure as { status?: number; error?: Message };
    throw new Error(response.status === 401 ? (loginAttempt ? 'Incorrect username or password.' : 'Please log in again.')
      : response.error?.message || 'The request failed. Check that the backend is running and try again.');
  }
}

function validAccount(account: unknown): Account {
  const value = account as { userId?: number; username?: string; role?: string } | null;
  if (
    !value || typeof value.userId !== 'number' || !Number.isInteger(value.userId) || value.userId < 1 ||
    typeof value.username !== 'string' || !value.username.trim() ||
    (value.role !== 'User' && value.role !== 'Admin')
  ) throw new Error('The server returned an invalid login response.');
  return { userId: value.userId, username: value.username, role: value.role };
}

export async function login(username: string, password: string): Promise<Account> {
  const account = await request<{ userId: number; username: string; role: 'User' | 'Admin' }>(
    () => api.api.usersLoginCreate({ username, password }), true,
  );
  return validAccount(account);
}

export async function currentAccount(): Promise<Account | null> {
  try {
    return validAccount((await api.api.usersMeList()).data);
  } catch (failure) {
    if ((failure as { status?: number }).status === 401) return null;
    throw failure;
  }
}

export const logout = () => request(() => api.api.usersLogoutCreate());

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
