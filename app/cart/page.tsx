'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCart, updateCartItemQuantity, removeFromCart, type Cart } from '@/lib/cart';

interface DesignData {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    border: string;
    success: string;
  };
  fonts: {
    titleFont: string;
    bodyFont: string;
  };
  style: {
    cornerRadius: number;
  };
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [design, setDesign] = useState<DesignData | null>(null);

  useEffect(() => {
    setCart(getCart());

    fetch('/api/design')
      .then(r => r.json())
      .then(setDesign)
      .catch(console.error);
  }, []);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = updateCartItemQuantity(productId, newQuantity);
    setCart(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = (productId: string) => {
    const updatedCart = removeFromCart(productId);
    setCart(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
          Your Cart is Empty
        </h1>
        <p className="mb-8" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
          Browse our collections to add items to your cart.
        </p>
        <Link
          href="/collections"
          className="inline-block px-8 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: design.colors.secondary, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="border p-6"
                style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                      {item.productName}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                      SKU: {item.sku}
                    </p>
                    <p className="text-sm" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                      Box of {item.unitsPerBox} units
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>Quantity:</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 border flex items-center justify-center hover:bg-gray-100"
                      style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 border flex items-center justify-center hover:bg-gray-100"
                      style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                      ${item.boxCost.toFixed(2)} per box
                    </p>
                    <p className="text-2xl font-bold" style={{ color: design.colors.secondary, fontFamily: design.fonts.titleFont }}>
                      ${(item.boxCost * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                      {item.quantity * item.unitsPerBox} total units
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/collections"
            className="inline-flex items-center mt-6 hover:opacity-80"
            style={{ color: design.colors.secondary, fontFamily: design.fonts.bodyFont }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div>
          <div
            className="border p-6 sticky top-24"
            style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                    {item.productName} × {item.quantity}
                  </span>
                  <span style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                    ${(item.boxCost * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6" style={{ borderColor: design.colors.border }}>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                  Total:
                </span>
                <span className="text-3xl font-bold" style={{ color: design.colors.secondary, fontFamily: design.fonts.titleFont }}>
                  ${cart.total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3 text-white text-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: design.colors.secondary, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
