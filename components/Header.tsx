'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCart } from '@/lib/cart';

interface Collection {
  id: string;
  name: string;
}

interface HeaderProps {
  companyName: string;
  logoPath: string | null;
  primaryColor: string;
  secondaryColor: string;
  collections?: Collection[];
}

export default function Header({ companyName, logoPath, primaryColor, secondaryColor, collections = [] }: HeaderProps) {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);

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
              <span className="text-2xl font-bold text-white">{companyName}</span>
            )}
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-white hover:opacity-80 transition-opacity"
            >
              Home
            </Link>

            {/* Collections Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowCollectionsDropdown(true)}
              onMouseLeave={() => setShowCollectionsDropdown(false)}
            >
              <Link
                href="/collections"
                className="text-white hover:opacity-80 transition-opacity flex items-center space-x-1"
              >
                <span>Collections</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {showCollectionsDropdown && collections.length > 0 && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg border rounded-lg overflow-hidden z-50"
                  style={{ borderColor: '#e5e5e5' }}
                >
                  <Link
                    href="/collections"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b"
                    style={{ borderColor: '#e5e5e5' }}
                  >
                    <span className="font-semibold" style={{ color: primaryColor }}>
                      All Collections
                    </span>
                  </Link>
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                      style={{ color: '#333333' }}
                    >
                      {collection.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/cart"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: secondaryColor }}
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
