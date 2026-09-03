import { NextResponse } from 'next/server';
import { getAllCollections } from '@/lib/catalog';
import { redactCollections } from '@/lib/pricing';

export async function GET() {
  try {
    const collections = getAllCollections();
    return NextResponse.json(redactCollections(collections));
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
