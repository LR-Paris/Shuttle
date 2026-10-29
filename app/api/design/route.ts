import { NextResponse } from 'next/server';
import { getDesignData } from '@/lib/design';
import { requireShopSession } from '@/lib/shopAuth';

// Disable caching for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireShopSession();
  if (denied) return denied;

  try {
    // Older copies of lib/design.ts put the shop password in the design data.
    // Drop it here too, so this route never sends it whichever copy a shop has.
    const { password: _password, ...design } = getDesignData() as ReturnType<typeof getDesignData> & { password?: string };
    return NextResponse.json(design);
  } catch (error) {
    console.error('Error fetching design data:', error);
    return NextResponse.json(
      { error: 'Failed to load design data' },
      { status: 500 }
    );
  }
}
