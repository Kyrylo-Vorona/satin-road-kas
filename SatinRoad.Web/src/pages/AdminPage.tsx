import CategoryList from '../components/CategoryList';
import { useAction } from '../hooks/useAction';
import { type CatalogProps } from '../types';
import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { createCategory, deleteCategory } from '../api.ts';

export default function AdminPage({ categories, products, onRefresh }: CatalogProps) {
  const { busy, error, message, setError, setMessage, perform } = useAction(onRefresh);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const selected = categories.find((item) => item.id === selectedId);
  const categoryProducts = products.filter((item) => item.categoryId === selectedId);

  function openForm() {
    setName('');
    setError('');
    setMessage('');
    setFormOpen(true);
  }

  function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }
    perform(
      () => createCategory(name.trim()),
      'Category saved.',
      () => setFormOpen(false),
      false,
    );
  }

  function removeCategory(category: CatalogProps['categories'][number]) {
    perform(
      () => deleteCategory(category.id),
      'Category deleted.',
      () => setFormOpen(false),
      false,
    );
  }

  return (
    <>
      <h2>Admin</h2>
      <section className="card">
        {selected && !formOpen && (
          <div className="admin-title-row">
            <button
              className="back-button secondary"
              onClick={() => setSelectedId(null)}
            >
              ← All categories
            </button>
            <h3>{selected.name}</h3>
          </div>
        )}
        {message && (
          <p
            className="preview-note"
            role="status"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            className="error"
            role="alert"
          >
            {error}
          </p>
        )}
        {formOpen ? (
          <form
            onSubmit={saveCategory}
            aria-busy={busy}
          >
            <h3>Create a category</h3>
            <label htmlFor="category-name">Category name</label>
            <input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={200}
              disabled={busy}
              autoFocus
            />
            <div className="admin-actions spaced">
              <button
                type="submit"
                disabled={busy}
              >
                {busy ? 'Saving…' : 'Save category'}
              </button>
              <button
                className="secondary"
                type="button"
                disabled={busy}
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : selected ? (
          <>
            <nav
              className="subcategory-bar"
              aria-label="Subcategories"
            >
              {['', ...(selected.subcategories || [])].map((name) => (
                <button
                  key={name}
                  disabled={Boolean(name)}
                  title={name ? 'Subcategories are not stored by the backend yet' : undefined}
                  className={name === '' ? '' : 'secondary'}
                  aria-pressed={name === ''}
                >
                  {name || 'All products'}
                </button>
              ))}
            </nav>
            <h3>
              All products <span className="product-count">({categoryProducts.length})</span>
            </h3>
            <div className="product-grid">
              {categoryProducts.map((product) => (
                <article
                  className="product"
                  key={product.id}
                >
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p>
                    <strong>Price: {product.price}</strong>
                  </p>
                  <span className="product-status">{product.sold ? 'Sold' : 'Available'}</span>
                </article>
              ))}
            </div>
            {!categoryProducts.length && (
              <p className="empty-state">No products in this category yet.</p>
            )}
          </>
        ) : (
          <>
            <div className="admin-heading">
              <h3>Categories</h3>
              <button
                disabled={busy}
                onClick={() => openForm()}
              >
                + Create a category
              </button>
            </div>
            <CategoryList
              categories={categories}
              products={products}
              onSelect={(category) => {
                setSelectedId(category.id);
                setMessage('');
              }}
              actions={(category) => (
                <div className="admin-actions">
                  <button
                    className="secondary"
                    disabled
                    title="Editing is not supported by the backend yet"
                    aria-label={`Edit ${category.name}`}
                  >
                    Edit
                  </button>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => removeCategory(category)}
                    aria-label={`Delete ${category.name}`}
                  >
                    Delete
                  </button>
                </div>
              )}
              emptyMessage="No categories yet. Create one to get started."
            />
          </>
        )}
      </section>
    </>
  );
}
