'use client';

import { useState, useEffect } from 'react';

interface PasswordProtectionProps {
  children: React.ReactNode;
  correctPassword: string;
  primaryColor: string;
  secondaryColor: string;
  titleFont: string;
  bodyFont: string;
  cornerRadius: number;
  companyName: string;
  logoPath: string | null;
  logoWhitePath?: string | null;
}

export default function PasswordProtection({
  children,
  correctPassword,
  primaryColor,
  secondaryColor,
  titleFont,
  bodyFont,
  cornerRadius,
  companyName,
  logoPath,
  logoWhitePath,
}: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === correctPassword) {
      sessionStorage.setItem('authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ fontFamily: bodyFont }}>
        <p style={{ color: primaryColor }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="flex items-center justify-center min-h-screen px-4"
        style={{
          backgroundColor: '#f9fafb',
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
              className="w-full py-3 text-white font-semibold hover:opacity-90 transition-opacity"
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

  return <>{children}</>;
}
