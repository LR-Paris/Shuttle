import { NextResponse } from 'next/server';
import { getVersionInfo } from '@/lib/version';
import { requireShopSession } from '@/lib/shopAuth';

export async function GET() {
  const denied = await requireShopSession();
  if (denied) return denied;

  try {
    const versionInfo = getVersionInfo();
    return NextResponse.json(versionInfo);
  } catch (error) {
    console.error('Error fetching version info:', error);
    return NextResponse.json({ error: 'Failed to fetch version info' }, { status: 500 });
  }
}
