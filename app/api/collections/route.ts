import { NextResponse } from 'next/server';
import { getAllCollections } from '@/lib/catalog';
import { requireShopSession } from '@/lib/shopAuth';

export async function GET() {
  const denied = await requireShopSession();
  if (denied) return denied;

  try {
    const collections = getAllCollections();
    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
