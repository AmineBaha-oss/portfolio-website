import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('admin_session');

  if (!cookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/dashboard'],
};
