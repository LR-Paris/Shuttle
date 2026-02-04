import { NextResponse } from 'next/server';
import { getAllCollections } from '@/lib/catalog';

export async function GET() {
  try {
    const collections = getAllCollections();
    const simplified = collections.map(c => ({
      id: c.id,
      name: c.name,
    }));

    return NextResponse.json(simplified);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to load collections' },
      { status: 500 }
    );
  }
}
