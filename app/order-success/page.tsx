'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  companyName: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [design, setDesign] = useState<DesignData | null>(null);

  useEffect(() => {
    fetch('/api/design')
      .then(r => r.json())
      .then(setDesign)
      .catch(console.error);
  }, []);

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: design.colors.success }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-4" style={{ color: design.colors.primary }}>
          Order Submitted Successfully!
        </h1>

        <p className="text-xl mb-2" style={{ color: design.colors.text }}>
          Thank you for your order.
        </p>

        {orderId && (
          <p className="text-lg mb-8" style={{ color: design.colors.textLight }}>
            Your order ID is: <span className="font-semibold">{orderId}</span>
          </p>
        )}

        <div
          className="border rounded-lg p-6 mb-8 text-left"
          style={{ borderColor: design.colors.border }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: design.colors.primary }}>
            What happens next?
          </h2>
          <ul className="space-y-3" style={{ color: design.colors.text }}>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: design.colors.success }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Our team will review your order and contact you to confirm details.</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: design.colors.success }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>We'll arrange shipping according to your freight preferences.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: design.colors.secondary }}
          >
            Return to Home
          </Link>
          <Link
            href="/collections"
            className="px-8 py-3 border rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            style={{ borderColor: design.colors.border, color: design.colors.primary }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
