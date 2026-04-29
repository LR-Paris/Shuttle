import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering — prevents Next.js from caching 404s for image URLs
export const dynamic = 'force-dynamic';

const DATABASE_PATH = path.join(process.cwd(), 'DATABASE');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveFile(filePath: string): NextResponse {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(DATABASE_PATH))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!fs.existsSync(resolved)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const buffer = fs.readFileSync(resolved);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');
    const folder = searchParams.get('folder') || 'ShowcasePhotos';
    const collection = searchParams.get('collection');
    const product = searchParams.get('product');

    if (!file) {
      return NextResponse.json({ error: 'No file specified' }, { status: 400 });
    }

    // Product images: ?folder=Products&collection=<slug>&product=<slug>&file=main.jpg
    if (folder === 'Products' && collection && product) {
      const collectionsDir = path.join(DATABASE_PATH, 'ShopCollections');
      if (!fs.existsSync(collectionsDir)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      for (const colDir of fs.readdirSync(collectionsDir, { withFileTypes: true })) {
        if (!colDir.isDirectory() || slugify(colDir.name) !== collection) continue;
        const colPath = path.join(collectionsDir, colDir.name);
        for (const itemDir of fs.readdirSync(colPath, { withFileTypes: true })) {
          if (!itemDir.isDirectory() || slugify(itemDir.name) !== product) continue;
          return serveFile(path.join(colPath, itemDir.name, 'Photos', file));
        }
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Logos: ?folder=Logos&file=logo.png
    if (folder === 'Logos') {
      return serveFile(path.join(DATABASE_PATH, 'Design', 'Logos', file));
    }

    // Showcase / hero images: ?folder=ShowcasePhotos&file=diwali.jpg
    // Also handles collection showcase: ?folder=ShowcasePhotos&file=Collections/diwali.jpg
    if (folder === 'ShowcasePhotos') {
      return serveFile(path.join(DATABASE_PATH, 'Design', 'ShowcasePhotos', file));
    }

    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
  } catch (error) {
    console.error('Image serve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
