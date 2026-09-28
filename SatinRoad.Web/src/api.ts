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
  const account = await request<{ userId: number }>(() => api.api.usersLoginCreate({ username, password }));
  if (!Number.isInteger(account?.userId)) throw new Error('The server returned an invalid login response.');
  return { userId: account.userId, username, role: 'User' };
}

// Display labels only: the backend does not store subcategories yet.
const subcategories: Record<string, string[]> = {
  technology: ['Laptops', 'Smartphones', 'Headphones', 'Cameras', 'Game consoles'],
  watches: ['Rolex', 'Omega', 'Seiko', 'Vintage watches', 'Pocket watches'],
  perfumes: ['Chanel', 'Dior', 'Tom Ford', 'Niche perfumes', 'Vintage fragrances'],
  books: ['First editions', 'Signed books', 'Rare books', 'Classic novels'],
  antiques: ['Old clocks', 'Vases', 'Furniture', 'Coins', 'Decorative objects'],
};

export async function getCategories(): Promise<Category[]> {
  const categories = await request<Omit<Category, 'subcategories'>[]>(() => api.api.categoriesList());
  return categories.map((item) => ({ ...item, subcategories: subcategories[item.name.toLowerCase()] || [] }));
}
export async function getProducts(): Promise<Product[]> {
  const products = await request<import('./generated/Api').Product[]>(() => api.api.productsList());
  return products.map((item) => ({ id: Number(item.id), name: item.name || '', price: Number(item.price), description: item.description ?? null, categoryId: item.categoryId == null ? null : Number(item.categoryId), owner: Number(item.userId), sold: item.isSold ?? false }));
}
export async function getPreviewOwners() {
  const users = await request<import('./generated/Api').User[]>(() => api.api.usersList());
  return users.map(({ id, username }) => ({ id: Number(id), username: username || '' }));
}
export async function getPreviewUser(): Promise<Account> {
  const users = await getPreviewOwners();
  const account = users.find((user) => user.username === 'user1');
  if (!account) throw new Error('The preview account user1 is unavailable.');
  return { userId: account.id, username: account.username, role: 'User', isPreview: true };
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
export async function buyProduct(productId: number, quantity: number, buyerId: number | null) {
  requireUser(buyerId);
  if (quantity !== 1) throw new Error('The backend currently supports one item per purchase.');
  const result = await request(() => api.api.productsBuyCreate({ productId, buyerId }));
  return { message: `Purchase successful! ${result?.message || ''}`.trim() };
}
