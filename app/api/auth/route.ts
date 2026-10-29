import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, setSessionCookie } from '@/lib/shopAuth';

export const dynamic = 'force-dynamic';

// Wrong passwords allowed per visitor before a pause
const MAX_FAILURES = 10;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;

const failures = new Map<string, { count: number; resetAt: number }>();

function visitorKey(request: NextRequest): string {
  // Cloudflare sets cf-connecting-ip; nginx sets x-real-ip.
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}

function recordFailure(key: string, now: number): void {
  const entry = failures.get(key);
  if (entry && entry.resetAt > now) {
    entry.count++;
  } else {
    failures.set(key, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
  }
  if (failures.size > 10000) {
    failures.forEach((value, k) => {
      if (value.resetAt <= now) failures.delete(k);
    });
  }
}

// POST /api/auth  { password }  → sets the session cookie when the password matches
export async function POST(request: NextRequest) {
  try {
    const key = visitorKey(request);
    const now = Date.now();
    const entry = failures.get(key);
    if (entry && entry.resetAt > now && entry.count >= MAX_FAILURES) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a few minutes and try again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) } }
      );
    }

    const body = await request.json().catch(() => null);
    const attempt = typeof body?.password === 'string' ? body.password : '';

    if (!checkPassword(attempt)) {
      recordFailure(key, now);
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    failures.delete(key);
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, request);
    return response;
  } catch (error) {
    console.error('Error checking shop password:', error);
    return NextResponse.json({ error: 'Failed to check password' }, { status: 500 });
  }
}
