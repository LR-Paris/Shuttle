import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/catalog';
import { requireShopSession } from '@/lib/shopAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const denied = await requireShopSession();
  if (denied) return denied;

  try {
    const { productId } = await params;
    const product = getProduct(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to load product' },
      { status: 500 }
    );
  }
}
