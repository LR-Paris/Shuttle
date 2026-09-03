import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Serve the shop's terms of use, if it has any.
 *
 * Read from DATABASE/Design/Details/Terms.txt rather than compiled in, so a
 * client who wants their own terms replaces one file. A shop with no file gets
 * `{ terms: '' }` and the footer link stays hidden — an empty terms page is
 * worse than none.
 */
export async function GET() {
  try {
    const file = path.join(process.cwd(), 'DATABASE', 'Design', 'Details', 'Terms.txt');
    if (!fs.existsSync(file)) {
      return NextResponse.json({ terms: '' });
    }
    return NextResponse.json({ terms: fs.readFileSync(file, 'utf-8').trim() });
  } catch (error) {
    console.error('Error reading terms:', error);
    return NextResponse.json({ terms: '' });
  }
}
