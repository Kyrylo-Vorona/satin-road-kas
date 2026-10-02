import CategoryList from '../components/CategoryList';
import { useAction } from '../hooks/useAction';
import { type Account, type CatalogProps, type Product, type ProductDraft } from '../types';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createProduct, deleteProduct, buyProduct } from '../api.ts';

export default function UserPage({
  user,
  products,
  categories,
  onRefresh,
}: CatalogProps & { user: Account }) {
  const { busy, error, message, setError, setMessage, perform } = useAction(onRefresh);
  const isGuest = user.role === 'Guest';
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [purchase, setPurchase] = useState<Product | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState('');
  const [guestNoticeId, setGuestNoticeId] = useState<number | null>(null);
  const purchaseDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (purchase) purchaseDialog.current?.showModal();
    else purchaseDialog.current?.close();
  }, [purchase]);
  const category = categories.find((item) => item.id === categoryId);
  const visibleProducts = products.filter(
    (product) =>
      !product.sold &&
      product.categoryId === categoryId &&
      `${product.name} ${product.description || ''}`.toLowerCase().includes(search.toLowerCase()),
  );

  function saveListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.name.trim() || !Number.isInteger(Number(draft.price)) || Number(draft.price) <= 0) {
      setError('Enter a name and a positive whole-number price.');
      return;
    }
    const data = {
      name: draft.name.trim(),
      price: Number(draft.price),
      description: draft.description,
      categoryId: draft.categoryId === '' ? null : Number(draft.categoryId),
    };
    const ownerId = user.userId;
    if (ownerId === null || !Number.isInteger(ownerId) || ownerId < 1) {
      setError('Please log in to continue.');
      return;
    }
    perform(
      () => createProduct(data, ownerId),
      'Product saved.',
      () => setDraft(null),
    );
  }

  function addListing() {
    setError('');
    setMessage('');
    setDraft({
      name: '',
      price: '',
      description: '',
      categoryId: category?.id ?? categories[0]?.id ?? '',
    });
  }

  function openPurchase(product: Product) {
    if (isGuest) return setGuestNoticeId(product.id);
    if (busy) return;
    setError('');
    setMessage('');
    setPurchaseSuccess('');
    setPurchase(product);
  }

  function actions(product: Product) {
    if (!isGuest && product.owner === user.userId) {
      return product.sold ? (
        <p>Sold</p>
      ) : (
        <div className="admin-actions spaced">
          <button
            className="secondary"
            disabled={busy}
            onClick={() =>
              perform(() => deleteProduct(product.id, user.userId), 'Product deleted.')
            }
          >
            Delete
          </button>
        </div>
      );
    }
    return (
      <div className="buy-action">
        <button
          className="spaced"
          disabled={busy}
          onClick={() => openPurchase(product)}
        >
          Buy
        </button>
        {isGuest && guestNoticeId === product.id && (
          <p
            className="guest-buy-notice"
            role="status"
          >
            Please log in or create an account to complete your purchase.
          </p>
        )}
      </div>
    );
  }

  function confirmPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!purchase || purchaseSuccess) return;
    if (isGuest) return;
    const selectedBuyerId = user.userId;
    if (selectedBuyerId === null || !Number.isInteger(selectedBuyerId) || selectedBuyerId < 1) {
      setError('Please log in to continue.');
      return;
    }
    if (selectedBuyerId === purchase.owner) {
      setError('You cannot buy your own product.');
      return;
    }
    perform(async () => {
      const result = await buyProduct(purchase.id, selectedBuyerId);
      setPurchaseSuccess(result.message);
      return result;
    }, 'Purchase completed.');
  }

  if (!isGuest && draft)
    return (
      <>
        <h2>User</h2>
        <section className="card">
          <form
            onSubmit={saveListing}
            aria-busy={busy}
          >
            <h3>Add Product</h3>
            {error && (
              <p
                className="error"
                role="alert"
              >
                {error}
              </p>
            )}
            <fieldset
              disabled={busy}
              className="form-fields"
            >
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                required
                maxLength={200}
                autoFocus
              />
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="text"
                inputMode="numeric"
                value={draft.price}
                onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                required
              />
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                maxLength={5000}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
              <label htmlFor="listing-category">Category</label>
              <select
                id="listing-category"
                value={draft.categoryId}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    categoryId: event.target.value === '' ? '' : Number(event.target.value),
                  })
                }
              >
                <option value="">Uncategorised</option>
                {categories.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
              <button
                className="spaced"
                type="submit"
              >
                {busy ? 'Saving…' : 'Save product'}
              </button>
              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setDraft(null);
                  setError('');
                }}
              >
                Cancel
              </button>
            </fieldset>
          </form>
        </section>
      </>
    );

  return (
    <>
      <dialog
        ref={purchaseDialog}
        className="purchase-dialog card"
        aria-labelledby="purchase-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
        onClose={() => setPurchase(null)}
      >
        {purchaseSuccess ? (
          <>
            <h2 id="purchase-title">Purchase successful!</h2>
            <p role="status">{purchaseSuccess.replace('Purchase successful! ', '')}</p>
            <button
              type="button"
              onClick={() => setPurchase(null)}
              autoFocus
            >
              Done
            </button>
          </>
        ) : (
          purchase && (
            <form
              onSubmit={confirmPurchase}
              aria-busy={busy}
            >
              <h2 id="purchase-title">Buy {purchase.name}</h2>
              <p>Price: {purchase.price}</p>
              {error && (
                <p
                  className="error"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <div className="admin-actions spaced">
                <button
                  type="submit"
                  disabled={busy}
                >
                  {busy ? 'Confirming…' : 'Confirm purchase'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  disabled={busy}
                  onClick={() => setPurchase(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )
        )}
      </dialog>
      <h2>{isGuest ? 'Guest' : 'User'}</h2>
      <section className="card">
        {message && (
          <p
            role="status"
            className="preview-note"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="error"
          >
            {error}
          </p>
        )}
        <div className="admin-heading">
          {category ? (
            <div className="admin-title-row">
              <button
                className="back-button secondary"
                onClick={() => {
                  setCategoryId(null);
                  setSearch('');
                }}
              >
                ← All categories
              </button>
              <h3>{category.name}</h3>
            </div>
          ) : (
            <h3>Categories</h3>
          )}
          {!isGuest && (
            <button
              disabled={busy}
              onClick={addListing}
            >
              + Add Product
            </button>
          )}
        </div>
        {!category ? (
          <>
            <CategoryList
              categories={categories}
              products={products}
              availableOnly
              onSelect={(item) => {
                setCategoryId(item.id);
                setSearch('');
              }}
              emptyMessage="No categories available yet."
            />
          </>
        ) : (
          <>
            <label htmlFor="search">Search products</label>
            <input
              id="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Product name or description"
            />
            <h3>
              All products <span className="product-count">({visibleProducts.length})</span>
            </h3>
            <div className="product-grid user-product-grid">
              {visibleProducts.map((product) => (
                <article
                  className="product product-with-details"
                  key={product.id}
                >
                  <div>
                    <h3>{product.name}</h3>
                    <p>Price: {product.price}</p>
                    {actions(product)}
                  </div>
                  <section
                    className="product-details"
                    aria-label={`${product.name} details`}
                  >
                    <p>{product.description || 'No description.'}</p>
                    <p>Category: {product.category || 'Uncategorised'}</p>
                  </section>
                </article>
              ))}
            </div>
            {!visibleProducts.length && <p>No products found.</p>}
          </>
        )}
      </section>
    </>
  );
}
