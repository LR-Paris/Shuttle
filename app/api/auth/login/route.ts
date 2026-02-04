import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPassword } from '@/lib/design';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = getPassword();

    if (password === correctPassword) {
      // Set cookie for 1 hour
      const cookieStore = await cookies();
      cookieStore.set('authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
