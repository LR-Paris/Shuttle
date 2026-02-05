import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATABASE_PATH = path.join(process.cwd(), 'DATABASE');
const SHOWCASE_PATH = path.join(DATABASE_PATH, 'Design', 'ShowcasePhotos');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const filePath = pathArray.join('/');
    const imagePath = path.join(SHOWCASE_PATH, filePath);

    // Security check: ensure the path is within SHOWCASE_PATH
    const resolvedPath = path.resolve(imagePath);
    const resolvedShowcasePath = path.resolve(SHOWCASE_PATH);
    if (!resolvedPath.startsWith(resolvedShowcasePath)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving showcase image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
