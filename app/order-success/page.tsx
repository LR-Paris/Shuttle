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
  company: string;
  items: OrderItem[];
  total: number;
}

function sanitize(str: string): string {
  return str.replace(/[^\x20-\x7E]/g, '');
}

function generateReceiptPDF(order: LastOrder, companyName: string): Blob {
  const W = 612;
  const H = 792;
  const M = 50;
  let y = H - M;
  let stream = '';

  const text = (s: string, x: number, yp: number, size: number, bold = false) => {
    const font = bold ? '/F2' : '/F1';
    const safe = sanitize(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    stream += `BT ${font} ${size} Tf ${x} ${yp} Td (${safe}) Tj ET\n`;
  };

  const line = (x1: number, y1: number, x2: number, y2: number, width = 0.5) => {
    stream += `${width} w ${x1} ${y1} m ${x2} ${y2} l S\n`;
  };

  // Header
  text(companyName, M, y, 22, true);
  y -= 28;
  text('ORDER RECEIPT', M, y, 14, true);
  y -= 24;
  line(M, y, W - M, y, 1);
  y -= 22;

  // Order info
  text(`Order ID:  ${order.orderId}`, M, y, 10);
  y -= 16;
  const dateStr = new Date(order.date).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  text(`Date:  ${dateStr}`, M, y, 10);
  y -= 16;
  text(`Customer:  ${order.name}`, M, y, 10);
  y -= 16;
  if (order.company) {
    text(`Company:  ${order.company}`, M, y, 10);
    y -= 16;
  }
  y -= 10;
  line(M, y, W - M, y);
  y -= 20;

  // Table header
  const colItem = M;
  const colQty = 340;
  const colPrice = 415;
  const colTotal = 500;

  text('Item', colItem, y, 10, true);
  text('Qty', colQty, y, 10, true);
  text('Price', colPrice, y, 10, true);
  text('Total', colTotal, y, 10, true);
  y -= 6;
  line(M, y, W - M, y);
  y -= 16;

  // Items
  for (const item of order.items) {
    const name = item.productName.length > 45
      ? item.productName.substring(0, 42) + '...'
      : item.productName;
    text(name, colItem, y, 10);
    text(`${item.quantity}`, colQty, y, 10);
    text(`$${item.boxCost.toFixed(2)}`, colPrice, y, 10);
    text(`$${(item.boxCost * item.quantity).toFixed(2)}`, colTotal, y, 10);
    y -= 14;
    text(`SKU: ${item.sku}  |  ${item.quantity * item.unitsPerBox} units (${item.unitsPerBox}/box)`, colItem + 8, y, 8);
    y -= 20;
  }

  // Total
  line(M, y, W - M, y, 1);
  y -= 22;
  text('Total:', colPrice, y, 13, true);
  text(`$${order.total.toFixed(2)}`, colTotal, y, 13, true);
  y -= 40;

  // Footer
  text('Thank you for your order!', M, y, 11);
  y -= 16;
  text('This receipt serves as confirmation of your order submission.', M, y, 9);

  // Build PDF document
  const objs = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (const obj of objs) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }

  const xrefStart = pdf.length;
  pdf += 'xref\n';
  pdf += `0 ${objs.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const off of offsets) {
    pdf += `${off.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += 'trailer\n';
  pdf += `<< /Size ${objs.length + 1} /Root 1 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefStart}\n`;
  pdf += '%%EOF';

  return new Blob([pdf], { type: 'application/pdf' });
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [design, setDesign] = useState<DesignData | null>(null);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

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

  const handleDownloadReceipt = () => {
    if (!lastOrder || !design) return;
    const blob = generateReceiptPDF(lastOrder, design.companyName);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${lastOrder.orderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

        {lastOrder && (
          <button
            onClick={handleDownloadReceipt}
            className="w-full mb-6 px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-white"
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
            Download PDF Receipt
          </button>
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
