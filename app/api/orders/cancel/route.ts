import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { restoreStock } from '@/lib/inventory';

const ORDERS_CSV = path.join(process.cwd(), 'DATABASE', 'Orders', 'orders.csv');
const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  fields.push(current);
  return fields;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    if (!fs.existsSync(ORDERS_CSV)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const content = fs.readFileSync(ORDERS_CSV, 'utf-8');
    const lines = content.split('\n');
    const header = lines[0];

    let orderLine: string | null = null;
    let orderLineIndex = -1;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = parseCSVLine(line);
      if (fields[0] === orderId) {
        orderLine = line;
        orderLineIndex = i;
        break;
      }
    }

    if (!orderLine || orderLineIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const fields = parseCSVLine(orderLine);
    const orderDate = new Date(fields[1]);
    const now = new Date();
    const elapsed = now.getTime() - orderDate.getTime();

    if (elapsed > CANCEL_WINDOW_MS) {
      return NextResponse.json(
        { error: 'Cancellation window has expired. Orders can only be cancelled within 2 hours of placement.' },
        { status: 403 }
      );
    }

    // Parse items from CSV (column index 12)
    let items: { productId: string; quantity: number }[] = [];
    try {
      const itemsJson = fields[12];
      const parsed = JSON.parse(itemsJson);
      items = parsed.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    } catch {
      console.warn('Could not parse order items for stock restoration');
    }

    // Restore inventory
    if (items.length > 0) {
      try {
        restoreStock(items);
      } catch (e) {
        console.warn('Stock restoration failed (non-blocking):', e);
      }
    }

    // Remove the order line from CSV
    const newLines = [header];
    for (let i = 1; i < lines.length; i++) {
      if (i === orderLineIndex) continue;
      const line = lines[i].trim();
      if (line) newLines.push(line);
    }
    fs.writeFileSync(ORDERS_CSV, newLines.join('\n') + '\n', 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully. Inventory has been restored.',
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
