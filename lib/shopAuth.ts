import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getPassword } from '@/lib/design';

/**
 * Shop password gate, checked on the server.
 *
 * The password in DATABASE/Design/Details/Password.txt never leaves the server.
 * POST /api/auth compares a visitor's attempt against it and, on a match, sets
 * an httpOnly session cookie. The layout and every API route except
 * /api/auth and the logo check that cookie.
 *
 * The cookie holds an expiry time and an HMAC of that time and the current
 * password, keyed with a random per-shop secret. Changing Password.txt signs
 * every visitor out; deleting .shop-session-secret does the same.
 */

export const SESSION_COOKIE = 'shop_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // seconds

const SECRET_PATH = path.join(process.cwd(), '.shop-session-secret');

let cachedSecret: Buffer | null = null;

function sessionSecret(): Buffer {
  if (cachedSecret) return cachedSecret;
  try {
    fs.writeFileSync(SECRET_PATH, crypto.randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 });
  } catch {
    // Already there from an earlier run.
  }
  const secret = Buffer.from(fs.readFileSync(SECRET_PATH, 'utf-8').trim(), 'hex');
  if (secret.length < 32) {
    throw new Error('.shop-session-secret is not a 64-character hex string; delete it and the shop makes a new one');
  }
  cachedSecret = secret;
  return secret;
}

function sign(expires: number, password: string): string {
  return crypto
    .createHmac('sha256', sessionSecret())
    .update(`${expires}.${password}`)
    .digest('base64url');
}

function sameBytes(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** True when the attempt matches Password.txt. */
export function checkPassword(attempt: string): boolean {
  // Hash both sides so the comparison takes the same time whatever the lengths.
  const sha = (s: string) => crypto.createHash('sha256').update(s).digest();
  return sameBytes(sha(attempt), sha(getPassword()));
}

/** True when the cookie value is an unexpired session for the current password. */
export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresText, signature] = token.split('.');
  const expires = Number(expiresText);
  if (!signature || !Number.isInteger(expires) || expires < Date.now() / 1000) return false;
  try {
    return sameBytes(Buffer.from(signature), Buffer.from(sign(expires, getPassword())));
  } catch (error) {
    console.error('Error checking shop session:', error);
    return false;
  }
}

/** For server components: is the visitor past the password gate? */
export async function hasShopSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSession(cookieStore.get(SESSION_COOKIE)?.value);
}

/**
 * For API routes: returns a 401 response when the visitor has not entered the
 * shop password, or null when the route may go on.
 */
export async function requireShopSession(): Promise<NextResponse | null> {
  if (await hasShopSession()) return null;
  return NextResponse.json({ error: 'Password required' }, { status: 401 });
}

function isHttps(request: NextRequest): boolean {
  if (request.nextUrl.protocol === 'https:') return true;
  if (request.headers.get('x-forwarded-proto')?.split(',')[0].trim() === 'https') return true;
  // Cloudflare in front of an http origin
  return request.headers.get('cf-visitor')?.includes('"https"') ?? false;
}

/** Sets the session cookie on a response, scoped to this shop's path. */
export function setSessionCookie(response: NextResponse, request: NextRequest): void {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  response.cookies.set(SESSION_COOKIE, `${expires}.${sign(expires, getPassword())}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps(request),
    // Every shop shares lrparisstore.com; the path keeps one shop's cookie out of another.
    // (request.nextUrl.basePath is empty inside route handlers.)
    path: process.env.NEXT_PUBLIC_BASE_PATH || '/',
    maxAge: SESSION_MAX_AGE,
  });
}
