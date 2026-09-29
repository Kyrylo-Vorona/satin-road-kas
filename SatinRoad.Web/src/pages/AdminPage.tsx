import CategoryList from '../components/CategoryList';
import { useAction } from '../hooks/useAction';
import { errorMessage, type CatalogProps } from '../types';
import type { FormEvent } from 'react';
import React, { useRef, useState } from 'react';
import { createCategory, deleteCategory } from '../api.ts';

export default function AdminPage({ categories, products, onRefresh }: CatalogProps) {
  const { busy, error, message, setError, setMessage, perform } = useAction(onRefresh);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const deleting = useRef(new Set<number>());
  const [deletingIds, setDeletingIds] = useState(new Set<number>());
  const selected = categories.find((item) => item.id === selectedId);
  const categoryProducts = products.filter((item) => item.categoryId === selectedId);

  function openForm(category?: CatalogProps['categories'][number]) {
    setEditingId(category?.id ?? null);
    setName(category?.name ?? '');
    setError('');
    setMessage('');
    setFormOpen(true);
  }

  function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId !== null) return;
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

  async function removeCategory(category: CatalogProps['categories'][number]) {
    if (deleting.current.has(category.id)) return;
    deleting.current.add(category.id);
    setDeletingIds(new Set(deleting.current));
    setError('');
    setMessage('');
    try {
      await deleteCategory(category.id);
      setMessage('Category deleted.');
      await onRefresh();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      deleting.current.delete(category.id);
      setDeletingIds(new Set(deleting.current));
    }
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
            <h3>{editingId === null ? 'Create a category' : 'Edit category'}</h3>
            {editingId !== null && (
              <p role="status">Category editing is ready to preview. Saving changes is not available yet.</p>
            )}
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
                disabled={busy || editingId !== null}
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
                    disabled={busy}
                    onClick={() => openForm(category)}
                    aria-label={`Edit ${category.name}`}
                  >
                    Edit
                  </button>
                  <button
                    className="secondary"
                    disabled={deletingIds.has(category.id)}
                    onClick={() => removeCategory(category)}
                    aria-label={`Delete category ${category.name}`}
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
