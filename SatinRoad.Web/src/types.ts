export interface Account {
  role: 'Guest' | 'User' | 'Admin';
  userId: number | null;
  username?: string;
  isPreview?: boolean;
}

export interface Category {
  id: number;
  name: string;
  subcategories: string[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  categoryId: number | null;
  category?: string;
  owner: number;
  sold: boolean;
}

export interface CatalogProps {
  categories: Category[];
  products: Product[];
  onRefresh: () => Promise<void>;
}

export interface ProductDraft {
  name: string;
  price: string;
  description: string;
  categoryId: number | '';
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';
