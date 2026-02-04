import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; filename: string }> }
) {
  try {
    const { productId, filename } = await params;

    // We need to find the actual collection and item folders that match this productId
    const collectionsPath = path.join(process.cwd(), 'DATABASE', 'ShopCollections');
    const collections = fs.readdirSync(collectionsPath, { withFileTypes: true });

    let imagePath: string | null = null;

    for (const collection of collections) {
      if (!collection.isDirectory()) continue;

      const collectionSlug = slugify(collection.name);
      const collectionPath = path.join(collectionsPath, collection.name);
      const items = fs.readdirSync(collectionPath, { withFileTypes: true });

      for (const item of items) {
        if (!item.isDirectory()) continue;

        // Generate the productId for this item and check if it matches
        const itemSlug = slugify(item.name);
        const expectedProductId = `${collectionSlug}-${itemSlug}`;

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
      // Return fallback image if available
      const fallbackPath = path.join(process.cwd(), 'public', 'fallback-image.png');
      if (fs.existsSync(fallbackPath)) {
        const fileBuffer = fs.readFileSync(fallbackPath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
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
