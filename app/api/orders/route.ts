import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  boxCost: number;
  unitsPerBox: number;
  quantity: number;
}

interface OrderData {
  name: string;
  email: string;
  phone: string;
  company: string;
  country?: string;
  shippingAddress: string;
  freightOption: string;
  freightCompany: string;
  freightAccount: string;
  freightContact: string;
  orderNotes: string;
  customFields?: Record<string, string | boolean>;
  items: OrderItem[];
  total: number;
}

// Matches original column order — new fields appended after Total for backward compat
const CSV_HEADER = 'Order ID,Date,Customer Name,Email,Phone,Company,Shipping Address,Freight Option,Freight Company,Freight Account,Freight Contact,Order Notes,Items,Total,Country,Billing Name,Billing Address,Billing City,Billing ZIP,Billing Country,Custom Fields,Status,Tracking Number';

function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

function escapeCSVField(field: string | number | boolean | null | undefined): string {
  if (field == null || field === '') return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    if (!orderData.name || !orderData.email || !orderData.items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = generateOrderId();
    const orderDate = new Date().toISOString();
    const cf = orderData.customFields || {};

    const freightInfo = orderData.freightOption === 'own'
      ? `Own: ${orderData.freightCompany} (${orderData.freightAccount}) - ${orderData.freightContact}`
      : 'LR Paris';

    const PROMOTED = new Set(['billingName','billingAddress','billingCity','billingZip','billingCountry','billingSameAsShipping']);
    const remainingCF: Record<string, string | boolean> = {};
    for (const [k, v] of Object.entries(cf)) {
      if (!PROMOTED.has(k)) remainingCF[k] = v;
    }
    const customFieldsJson = Object.keys(remainingCF).length ? JSON.stringify(remainingCF) : '';

    // Original 14 columns first (matches existing CSV headers), then new columns appended
    const csvRow = [
      escapeCSVField(orderId),
      escapeCSVField(orderDate),
      escapeCSVField(orderData.name),
      escapeCSVField(orderData.email),
      escapeCSVField(orderData.phone || ''),
      escapeCSVField(orderData.company || ''),
      escapeCSVField(orderData.shippingAddress || ''),
      escapeCSVField(freightInfo),
      escapeCSVField(orderData.freightCompany || ''),
      escapeCSVField(orderData.freightAccount || ''),
      escapeCSVField(orderData.freightContact || ''),
      escapeCSVField(orderData.orderNotes || ''),
      escapeCSVField(JSON.stringify(orderData.items)),
      escapeCSVField(orderData.total.toFixed(2)),
      // New columns appended — backward-compatible with existing CSVs
      escapeCSVField(orderData.country || ''),
      escapeCSVField(String(cf.billingName || '')),
      escapeCSVField(String(cf.billingAddress || '')),
      escapeCSVField(String(cf.billingCity || '')),
      escapeCSVField(String(cf.billingZip || '')),
      escapeCSVField(String(cf.billingCountry || '')),
      escapeCSVField(customFieldsJson),
      escapeCSVField(''),
      escapeCSVField(''),
    ].join(',');

    const ordersPath = path.join(process.cwd(), 'DATABASE', 'Orders', 'orders.csv');
    fs.mkdirSync(path.dirname(ordersPath), { recursive: true });

    // Write header only if file is new
    if (!fs.existsSync(ordersPath)) {
      fs.writeFileSync(ordersPath, CSV_HEADER + '\n', 'utf-8');
    }
    fs.appendFileSync(ordersPath, csvRow + '\n', 'utf-8');

    // Notify Launchpad (fire-and-forget) — triggers confirmation email
    const launchpadUrl = process.env.LAUNCHPAD_API_URL;
    const slug = process.env.SHOP_SLUG;
    if (launchpadUrl && slug) {
      const billingParts = [
        String(cf.billingAddress || ''),
        String(cf.billingCity || ''),
        String(cf.billingZip || ''),
        String(cf.billingCountry || ''),
      ].filter(Boolean);

      const notifyPayload = {
        orderId,
        'Order ID': orderId,
        Date: orderDate,
        'Customer Name': orderData.name,
        name: orderData.name,
        email: orderData.email,
        Email: orderData.email,
        Phone: orderData.phone || '',
        Company: orderData.company || '',
        Country: orderData.country || '',
        country: orderData.country || '',
        'Shipping Address': orderData.shippingAddress || '',
        'Freight Option': freightInfo,
        'Freight Company': orderData.freightCompany || '',
        'Freight Account': orderData.freightAccount || '',
        'Freight Contact': orderData.freightContact || '',
        'Billing Name': String(cf.billingName || ''),
        'Billing Address': billingParts.join(', '),
        'Billing City': String(cf.billingCity || ''),
        'Billing ZIP': String(cf.billingZip || ''),
        'Billing Country': String(cf.billingCountry || ''),
        'Order Notes': orderData.orderNotes || '',
        'Custom Fields': customFieldsJson,
        Items: JSON.stringify(orderData.items),
        items: orderData.items,
        Total: orderData.total.toFixed(2),
        total: orderData.total,
      };

      fetch(`${launchpadUrl}/api/shops/${slug}/orders/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData: notifyPayload }),
      }).catch(err => console.error('[orders] Notify failed:', err));
    }

    return NextResponse.json({ success: true, orderId, message: 'Order submitted successfully' });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
