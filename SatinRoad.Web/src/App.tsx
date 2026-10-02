import { errorMessage, type Account, type Category, type Product } from './types';
import React, { useEffect, useState } from 'react';
import Login from './pages/Login.tsx';
import UserPage from './pages/UserPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import { currentAccount, getCategories, getProducts, logout } from './api.ts';

export default function App() {
  const [user, setUser] = useState<Account | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    currentAccount().then(setUser).catch(() => {}).finally(() => setCheckingSession(false));
  }, []);

  async function leaveAccount(nextUser: Account | null) {
    setSessionError('');
    try {
      await logout();
      setUser(nextUser);
    } catch {
      setSessionError('Could not log out. Please try again.');
    }
  }

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

  if (checkingSession) return <main className="layout"><p role="status">Checking session…</p></main>;

  if (user)
    return (
      <main className="dashboard">
        <header className="page-header">
          <h1>KAS Satin Road</h1>
          <button onClick={() => void leaveAccount(null)}>Back to login</button>
        </header>
        {sessionError && <p role="alert">{sessionError}</p>}
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
        {sessionError && <p role="alert">{sessionError}</p>}
        <Login
          onLogin={setUser}
          onGuest={() => void leaveAccount({ role: 'Guest', userId: null })}
        />
      </div>
    </main>
  );
}
