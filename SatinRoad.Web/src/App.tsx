import { errorMessage, type Account, type Category, type Product } from './types';
import React, { useEffect, useState } from 'react';
import Login from './pages/Login.tsx';
import UserPage from './pages/UserPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import { getCategories, getProducts, getPreviewUser } from './api.ts';

export default function App() {
  const [user, setUser] = useState<Account | null>(null);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const [categoryData, productData] = await Promise.all([getCategories(), getProducts()]);
    setCategories(categoryData);
    setProducts(
      productData.map((item) => ({
        ...item,
        category: categoryData.find((category) => category.id === item.categoryId)?.name || '',
      })),
    );
  }

  async function load() {
    setLoading(true);
    setError('');
    try {
      await refresh();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function openPreview(role: Account['role']) {
    setMessage('');
    try {
      setUser(role === 'User' ? await getPreviewUser() : { role, userId: null });
    } catch (failure) {
      setMessage(errorMessage(failure));
    }
  }

  if (user)
    return (
      <main className="dashboard">
        <header className="page-header">
          <h1>KAS Satin Road</h1>
          <button onClick={() => setUser(null)}>Back to login</button>
        </header>
        {user.role === 'Admin' && (
          <p className="preview-note">
            Admin preview uses real database data. Creating or deleting a category saves the change.
          </p>
        )}
        {user.isPreview && (
          <p className="preview-note">
            Preview User: {user.username}. Products and purchases save to the database.
          </p>
        )}
        {loading ? (
          <p role="status">Loading…</p>
        ) : error ? (
          <section className="card">
            <p
              className="error"
              role="alert"
            >
              {error}
            </p>
            <button onClick={load}>Retry</button>
          </section>
        ) : user.role === 'Admin' ? (
          <AdminPage
            categories={categories}
            products={products}
            onRefresh={refresh}
          />
        ) : (
          <UserPage
            user={user}
            products={products}
            categories={categories}
            onRefresh={refresh}
          />
        )}
      </main>
    );

  return (
    <main className="layout">
      <section
        className="welcome-card"
        aria-labelledby="site-title"
      >
        <h1 id="site-title">KAS Satin Road</h1>
        <p className="welcome-message">Welcome</p>
        <p>Log in to buy and sell products, or continue as a guest to browse.</p>
      </section>
      <div className="card">
        {message && (
          <p
            className="preview-note"
            role="status"
          >
            {message}
          </p>
        )}
        <Login
          onLogin={setUser}
          onGuest={() => openPreview('Guest')}
        />
        <div
          className="admin-actions spaced"
          aria-label="Preview sections"
        >
          <button
            className="secondary"
            onClick={() => openPreview('User')}
          >
            Preview User
          </button>
          <button
            className="secondary"
            onClick={() => openPreview('Admin')}
          >
            Preview Admin
          </button>
        </div>
      </div>
    </main>
  );
}
