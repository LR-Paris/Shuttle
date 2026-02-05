import { NextResponse } from 'next/server';
import { getVersionInfo } from '@/lib/version';

export async function GET() {
  try {
    const versionInfo = getVersionInfo();
    return NextResponse.json(versionInfo);
  } catch (error) {
    console.error('Error fetching version info:', error);
    return NextResponse.json({ error: 'Failed to fetch version info' }, { status: 500 });
  }
}
