import { NextResponse } from 'next/server';
import { getFAQData } from '@/lib/design';

export async function GET() {
  try {
    const faqs = getFAQData();
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ data' }, { status: 500 });
  }
}
