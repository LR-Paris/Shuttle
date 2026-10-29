'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface PasswordProtectionProps {
  primaryColor: string;
  secondaryColor: string;
  titleFont: string;
  bodyFont: string;
  cornerRadius: number;
  companyName: string;
  logoPath: string | null;
  logoWhitePath?: string | null;
}

// The password gate. The layout renders it instead of the shop until the
// visitor has a session cookie; the password itself is checked on the server.
export default function PasswordProtection({
  primaryColor,
  secondaryColor,
  titleFont,
  bodyFont,
  cornerRadius,
  companyName,
  logoPath,
}: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiFetch('/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Reload so the server renders the shop with the new session cookie.
        window.location.reload();
        return;
      }

      const data = await response.json().catch(() => null);
      setError(data?.error || 'Incorrect password. Please try again.');
    } catch {
      setError('Could not check the password. Please try again.');
    }

    setPassword('');
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4 overflow-y-auto"
      style={{
        backgroundColor: '#f9fafb',
        zIndex: 2147483647,
        fontFamily: bodyFont
      }}
    >
      <div
        className="w-full max-w-md p-8 shadow-lg"
        style={{
          backgroundColor: 'white',
          borderRadius: `${cornerRadius}px`
        }}
      >
        <div className="flex justify-center mb-2">
          {logoPath ? (
            <img
              src={logoPath}
              alt={companyName}
              className="h-12 md:h-16 w-auto flex-shrink-0"
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <h1
              className="text-3xl font-bold text-center"
              style={{
                color: primaryColor,
                fontFamily: titleFont
              }}
            >
              {companyName}
            </h1>
          )}
        </div>
        <p
          className="text-center mb-6"
          style={{
            color: '#666666',
            fontFamily: bodyFont
          }}
        >
          Please enter your password to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
              style={{
                color: primaryColor,
                fontFamily: bodyFont
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border focus:outline-none focus:ring-2"
              style={{
                borderColor: '#e5e5e5',
                borderRadius: `${cornerRadius}px`,
                fontFamily: bodyFont
              }}
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <p
              className="text-sm"
              style={{
                color: '#ef4444',
                fontFamily: bodyFont
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{
              backgroundColor: secondaryColor,
              borderRadius: `${cornerRadius}px`,
              fontFamily: bodyFont
            }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
