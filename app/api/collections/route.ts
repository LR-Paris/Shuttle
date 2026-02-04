import { NextResponse } from 'next/server';
import { getAllCollections } from '@/lib/catalog';

export async function GET() {
  try {
    const collections = getAllCollections();
    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
