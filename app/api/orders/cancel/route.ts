import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { restoreStock } from '@/lib/inventory';
import { splitCsvRecords, parseCSVLine } from '@/lib/csv';

const ORDERS_CSV = path.join(process.cwd(), 'DATABASE', 'Orders', 'orders.csv');
const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Notify Launchpad that an order was cancelled from the storefront.
 *
 * Rebuilt from the CSV header rather than a fixed field list, so a shop whose
 * checkout schema adds columns still reports them and column order changes
 * cannot silently misalign the e-mail.
 */
async function notifyCancelled(header: string, fields: string[], reason = '') {
  // Same pair the order route uses. NEXT_PUBLIC_LAUNCHPAD_API is deliberately
  // blank so the browser talks to relative paths, and it is not what a
  // server-side route should read: this call is made inside the container over
  // the Docker bridge, so it needs LAUNCHPAD_API_URL. Reading the public one
  // meant this notification silently never fired.
  const api = process.env.LAUNCHPAD_API_URL;
  const slug = process.env.SHOP_SLUG;
  if (!api || !slug) {
    console.warn('[cancel] LAUNCHPAD_API_URL or SHOP_SLUG unset — no cancellation e-mail sent');
    return;
  }
  try {
    const keys = parseCSVLine(header);
    const row: Record<string, string> = {};
    keys.forEach((k, i) => { row[k] = fields[i] ?? ''; });
    await fetch(`${api}/api/shops/${slug}/orders/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'cancelled', orderData: row, reason }),
    });
  } catch (e) {
    console.warn('Cancellation notify failed (non-blocking):', e);
  }
}



export async function POST(request: NextRequest) {
  try {
    const { orderId, reason } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    if (!fs.existsSync(ORDERS_CSV)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const content = fs.readFileSync(ORDERS_CSV, 'utf-8');
    const lines = splitCsvRecords(content);
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

    // Tell Launchpad the order is gone so the cancellation e-mails go out.
    // Non-blocking: a shop with no Launchpad configured still cancels cleanly.
    await notifyCancelled(header, fields, typeof reason === 'string' ? reason : '');

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
