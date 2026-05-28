import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const COOKIE_NAME = 'admin_session';

function computeToken(): string {
  return createHmac('sha256', process.env.ADMIN_PASSCODE || '').update('admin-session').digest('hex');
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function POST(request: NextRequest) {
  const { passcode } = await request.json();

  if (!passcode || !process.env.ADMIN_PASSCODE || passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, computeToken(), cookieOptions(60 * 60 * 24 * 7));
  return response;
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME);

  if (!cookie?.value || cookie.value !== computeToken()) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({ token: cookie.value });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', cookieOptions(0));
  return response;
}
