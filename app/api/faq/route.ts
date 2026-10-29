import { NextResponse } from 'next/server';
import { getFAQData } from '@/lib/design';
import { requireShopSession } from '@/lib/shopAuth';

export async function GET() {
  const denied = await requireShopSession();
  if (denied) return denied;

  try {
    const faqs = getFAQData();
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ data' }, { status: 500 });
  }
}
