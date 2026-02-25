import { NextResponse } from 'next/server';
import { getPresetsData } from '@/lib/presets';

// Disable caching for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const presets = getPresetsData();
    return NextResponse.json(presets);
  } catch (error) {
    console.error('Error fetching presets data:', error);
    return NextResponse.json(
      { error: 'Failed to load presets data' },
      { status: 500 }
    );
  }
}
