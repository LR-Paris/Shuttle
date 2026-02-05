'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCart } from '@/lib/cart';

interface HeaderProps {
  companyName: string;
  logoPath: string | null;
  primaryColor: string;
  secondaryColor: string;
  titleFont?: string;
  bodyFont?: string;
  cornerRadius?: number;
}

export default function Header({
  companyName,
  logoPath,
  primaryColor,
  secondaryColor,
  titleFont = 'Inter',
  bodyFont = 'Inter',
  cornerRadius = 12
}: HeaderProps) {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalItems);
    };

    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  return (
    <header
      className="shadow-md sticky top-0 z-50"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            {logoPath ? (
              <img src={logoPath} alt={companyName} className="h-10 w-auto" />
            ) : (
              <span className="text-2xl font-bold text-white" style={{ fontFamily: titleFont }}>{companyName}</span>
            )}
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-white hover:opacity-80 transition-opacity"
              style={{ fontFamily: bodyFont }}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-white hover:opacity-80 transition-opacity"
              style={{ fontFamily: bodyFont }}
            >
              About
            </Link>
            <Link
              href="/collections"
              className="text-white hover:opacity-80 transition-opacity"
              style={{ fontFamily: bodyFont }}
            >
              Collections
            </Link>
            <Link
              href="/shop-all"
              className="text-white hover:opacity-80 transition-opacity"
              style={{ fontFamily: bodyFont }}
            >
              Shop All
            </Link>
            <Link
              href="/cart"
              className="flex items-center space-x-2 px-4 py-2 text-white hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: secondaryColor,
                borderRadius: `${cornerRadius}px`,
                fontFamily: bodyFont
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Cart ({cartItemCount})</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
