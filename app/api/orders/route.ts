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
  shippingAddress: string;
  freightOption: string;
  freightCompany: string;
  freightAccount: string;
  freightContact: string;
  orderNotes: string;
  items: OrderItem[];
  total: number;
  // STS-2.00 new fields
  shopType?: string;
  poNumber?: string;
  hotelSelection?: string;
}

const CSV_HEADER = 'Order ID,Date,Customer Name,Email,Phone,Company,Shipping Address,Freight Option,Freight Company,Freight Account,Freight Contact,Order Notes,Items,Total,Shop Type,PO Number,PO File,Hotel Selection';

function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

function escapeCSVField(field: string): string {
  if (!field) return '';
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Ensures the orders.csv file exists with the correct STS-2.00 header.
 * If the file already exists with the old header, it migrates by prepending the new header
 * and appending empty columns to existing rows.
 */
function ensureCSVHeader(ordersPath: string): void {
  const ordersDir = path.dirname(ordersPath);
  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
  }

  if (!fs.existsSync(ordersPath)) {
    // Fresh file — write new header
    fs.writeFileSync(ordersPath, CSV_HEADER + '\n', 'utf-8');
    return;
  }

  const content = fs.readFileSync(ordersPath, 'utf-8');
  const firstLine = content.split('\n')[0] || '';

  // If header already has the new columns, nothing to do
  if (firstLine.includes('Shop Type')) {
    return;
  }

  // Migrate: replace old header with new, pad existing data rows with empty new columns
  const lines = content.split('\n');
  const migrated: string[] = [CSV_HEADER];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Append 4 empty columns for: Shop Type, PO Number, PO File, Hotel Selection
    migrated.push(line + ',free,,,');
  }

  fs.writeFileSync(ordersPath, migrated.join('\n') + '\n', 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    // Validate required fields — name is always required
    if (!orderData.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const orderDate = new Date().toISOString();

    // Format items as JSON string for CSV
    const itemsJson = JSON.stringify(orderData.items);

    // Prepare freight info
    const freightInfo = orderData.freightOption === 'own'
      ? `Own: ${orderData.freightCompany} (${orderData.freightAccount}) - ${orderData.freightContact}`
      : orderData.freightOption ? 'LR Paris' : '';

    // Determine PO file reference
    const shopType = orderData.shopType || 'free';
    const poNumber = orderData.poNumber || '';
    const poFile = shopType === 'po' && poNumber ? `${orderId}.pdf` : '';
    const hotelSelection = orderData.hotelSelection || '';

    // Create CSV row with new columns
    const csvRow = [
      escapeCSVField(orderId),
      escapeCSVField(orderDate),
      escapeCSVField(orderData.name),
      escapeCSVField(orderData.email || ''),
      escapeCSVField(orderData.phone || ''),
      escapeCSVField(orderData.company || ''),
      escapeCSVField(orderData.shippingAddress || ''),
      escapeCSVField(freightInfo),
      escapeCSVField(orderData.freightCompany || ''),
      escapeCSVField(orderData.freightAccount || ''),
      escapeCSVField(orderData.freightContact || ''),
      escapeCSVField(orderData.orderNotes || ''),
      escapeCSVField(itemsJson),
      escapeCSVField(orderData.total.toFixed(2)),
      escapeCSVField(shopType),
      escapeCSVField(poNumber),
      escapeCSVField(poFile),
      escapeCSVField(hotelSelection),
    ].join(',');

    // Append to orders.csv
    const ordersPath = path.join(process.cwd(), 'DATABASE', 'Orders', 'orders.csv');

    // Ensure header is up to date (handles migration from old format)
    ensureCSVHeader(ordersPath);

    // Append the order
    fs.appendFileSync(ordersPath, csvRow + '\n', 'utf-8');

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order submitted successfully',
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
