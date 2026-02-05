import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllProducts } from '@/lib/catalog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; filename: string }> }
) {
  try {
    const { productId, filename } = await params;

    // Get all products to find the matching product by ID
    const products = getAllProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Parse the product ID to get collection and item folder names
    // productId format: "collection-slug-item-slug" (e.g., "office-essentials-designer-tote-bag")
    const collectionSlug = product.collectionId;

    // Search for the matching collection folder
    const collectionsPath = path.join(process.cwd(), 'DATABASE', 'ShopCollections');
    const collections = fs.readdirSync(collectionsPath, { withFileTypes: true });

    let imagePath: string | null = null;

    // Function to slugify for comparison
    function slugify(text: string): string {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    for (const collection of collections) {
      if (!collection.isDirectory()) continue;

      const collectionSlugified = slugify(collection.name);
      if (collectionSlugified !== collectionSlug) continue;

      const collectionPath = path.join(collectionsPath, collection.name);
      const items = fs.readdirSync(collectionPath, { withFileTypes: true });

      for (const item of items) {
        if (!item.isDirectory()) continue;

        const itemSlugified = slugify(item.name);
        const expectedProductId = `${collectionSlug}-${itemSlugified}`;

        if (expectedProductId === productId) {
          const photosPath = path.join(collectionPath, item.name, 'Photos', filename);
          if (fs.existsSync(photosPath)) {
            imagePath = photosPath;
            break;
          }
        }
      }

      if (imagePath) break;
    }

    if (!imagePath) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(filename).toLowerCase();

    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving product image:', error);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
