import { NextRequest, NextResponse } from 'next/server';
import { getInventory, getStockByProductId, seedInventory } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      const stock = getStockByProductId(productId);
      if (stock === null) {
        return NextResponse.json({ error: 'Product not found in inventory' }, { status: 404 });
      }
      const inventory = getInventory();
      const record = inventory.find(r => r.productId === productId);
      return NextResponse.json(record);
    }

    const inventory = getInventory();
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error reading inventory:', error);
    return NextResponse.json({ error: 'Failed to read inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'seed') {
      seedInventory();
      const inventory = getInventory();
      return NextResponse.json({ success: true, total: inventory.length });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing inventory action:', error);
    return NextResponse.json({ error: 'Failed to process inventory action' }, { status: 500 });
  }
}
