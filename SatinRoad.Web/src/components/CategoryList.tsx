import type { ReactNode } from 'react';
import type { Category, Product } from '../types';

interface Props {
  categories: Category[];
  products: Product[];
  onSelect: (category: Category) => void;
  actions?: (category: Category) => ReactNode;
  availableOnly?: boolean;
  emptyMessage: string;
}

export default function CategoryList({
  categories,
  products,
  onSelect,
  actions,
  availableOnly,
  emptyMessage,
}: Props) {
  return (
    <>
      <ul className="admin-category-list">
        {categories.map((category) => (
          <li
            className="admin-category-row"
            key={category.id}
          >
            <button
              className="category-link"
              onClick={() => onSelect(category)}
            >
              <span>
                <strong>{category.name}</strong>
                <small>
                  {
                    products.filter(
                      (product) =>
                        product.categoryId === category.id && (!availableOnly || !product.sold),
                    ).length
                  }{' '}
                  products
                </small>
              </span>
              <span aria-hidden="true">→</span>
            </button>
            {actions?.(category)}
          </li>
        ))}
      </ul>
      {!categories.length && <p className="empty-state">{emptyMessage}</p>}
    </>
  );
}
