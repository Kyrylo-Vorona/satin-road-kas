import { errorMessage, type Account } from '../types';
import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { login } from '../api.ts';

export default function Login({
  onLogin,
  onGuest,
}: {
  onLogin: (user: Account) => void;
  onGuest: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      onLogin(await login(username.trim(), password));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Log in</h2>
      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
      >
        {[
          {
            id: 'username',
            label: 'Username',
            value: username,
            setValue: setUsername,
            type: 'text',
            autoComplete: 'username',
          },
          {
            id: 'password',
            label: 'Password',
            value: password,
            setValue: setPassword,
            type: showPassword ? 'text' : 'password',
            autoComplete: 'current-password',
          },
        ].map((field) => (
          <React.Fragment key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              autoCapitalize={field.id === 'username' ? 'none' : undefined}
              spellCheck={field.id === 'username' ? false : undefined}
              value={field.value}
              onChange={(event) => field.setValue(event.target.value)}
              disabled={loading}
              required
            />
          </React.Fragment>
        ))}
        <label className="show-password">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Show password
        </label>
        {error && (
          <p
            className="error"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Please wait…' : 'Log in'}
        </button>
      </form>
      <button
        className="secondary"
        type="button"
        onClick={onGuest}
        disabled={loading}
      >
        Continue as Guest
      </button>
      <p className="hint">Log in to buy or sell.</p>
    </>
  );
}
