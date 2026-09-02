'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useShopPresets } from '@/lib/useShopPresets';
import { generateOrderPdf } from '@/lib/orderPdf';

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
  contactEmail: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  boxCost: number;
  unitsPerBox: number;
  quantity: number;
}

interface LastOrder {
  orderId: string;
  date: string;
  name: string;
  email?: string;
  phone?: string;
  company: string;
  brand?: string;
  inHandDate?: string;
  estimatedBudget?: string;
  poNumber?: string;
  artLink?: string;
  shippingAddress?: string;
  billingAddress?: string;
  items: OrderItem[];
  total: number;
}

function sanitize(str: string): string {
  return str.replace(/[^\x20-\x7E]/g, '');
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [design, setDesign] = useState<DesignData | null>(null);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const { showPrices, isRequest } = useShopPresets();

  useEffect(() => {
    fetch('/api/design')
      .then(r => r.json())
      .then(setDesign)
      .catch(console.error);

    try {
      const stored = sessionStorage.getItem('lastOrder');
      if (stored) {
        setLastOrder(JSON.parse(stored));
      }
    } catch { /* sessionStorage unavailable */ }
  }, []);

  const handleDownloadReceipt = async () => {
    if (!lastOrder || !design) return;
    const items = await Promise.all(
      lastOrder.items.map(async i => {
        let imageUrl: string | undefined;
        try {
          const res = await fetch(`/api/products/${i.productId}`);
          if (res.ok) {
            const p = await res.json();
            if (Array.isArray(p.images) && p.images.length > 0) imageUrl = p.images[0];
          }
        } catch { /* a thumbnail is not worth failing the download over */ }
        return {
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          quantity: i.quantity,
          imageUrl,
        };
      })
    );
    const blob = await generateOrderPdf({ ...lastOrder, items });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${lastOrder.orderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.'
    );
    if (!confirmed) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();

      if (!response.ok) {
        setCancelError(result.error || 'Failed to cancel order');
        return;
      }

      setCancelled(true);
      sessionStorage.removeItem('lastOrder');
    } catch {
      setCancelError('Failed to cancel order. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#DC2626' }}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-4" style={{ color: design.colors.primary }}>
            Order Cancelled
          </h1>

          <p className="text-xl mb-2" style={{ color: design.colors.text }}>
            Your order has been cancelled and inventory has been restored.
          </p>

          {orderId && (
            <p className="text-lg mb-8" style={{ color: design.colors.textLight }}>
              Order ID: <span className="font-semibold">{orderId}</span>
            </p>
          )}

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
          {isRequest ? 'Request Submitted' : 'Order Submitted Successfully!'}
        </h1>

        <p className="text-xl mb-2" style={{ color: design.colors.text }}>
          {isRequest
            ? 'Thank you. This is a request for approval, not an order confirmation. Nothing is produced or shipped until specifications, pricing and lead time are confirmed in writing.'
            : 'Thank you for your order.'}
        </p>

        {orderId && (
          <p className="text-lg mb-8" style={{ color: design.colors.textLight }}>
            Your {isRequest ? 'request' : 'order'} ID is: <span className="font-semibold">{orderId}</span>
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
              <span>Our team will review your {isRequest ? 'request' : 'order'} and contact you to confirm details.</span>
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
              <span>{isRequest
                ? 'Freight, duty and taxes are quoted separately once volume and ship-to country are confirmed.'
                : 'We\u2019ll arrange shipping according to your freight preferences.'}</span>
            </li>
          </ul>
        </div>

        {/* Contact email + 2-hour edit window notice */}
        <div
          className="border rounded-lg p-6 mb-8 text-left"
          style={{ borderColor: design.colors.border, backgroundColor: '#FFFBEB' }}
        >
          <p className="text-sm" style={{ color: design.colors.text }}>
            Need to make changes? You have a <strong>2-hour window</strong> to cancel your {isRequest ? 'request' : 'order'} using the button below.
            {design.contactEmail && (
              <>
                {' '}After that, please contact{' '}
                <a
                  href={`mailto:${design.contactEmail}`}
                  className="underline font-semibold"
                  style={{ color: design.colors.secondary }}
                >
                  {design.contactEmail}
                </a>{' '}
                to request changes.
              </>
            )}
          </p>
        </div>

        {lastOrder && (
          <button
            onClick={handleDownloadReceipt}
            className="w-full mb-4 px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-white"
            style={{ backgroundColor: design.colors.primary }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isRequest ? 'Download PDF Summary' : 'Download PDF Receipt'}
          </button>
        )}

        {/* Cancel Order Button */}
        {orderId && (
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="w-full mb-6 px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity border"
            style={{
              borderColor: '#DC2626',
              color: '#DC2626',
              backgroundColor: 'transparent',
            }}
          >
            {isCancelling ? (
              'Cancelling...'
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {isRequest ? 'Cancel Request' : 'Cancel Order'}
              </>
            )}
          </button>
        )}

        {cancelError && (
          <div
            className="mb-6 p-4 rounded-lg text-sm"
            style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
          >
            {cancelError}
          </div>
        )}

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
