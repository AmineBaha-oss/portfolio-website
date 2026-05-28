import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export interface JwtPayload {
  sub?: string;
  [key: string]: unknown;
}

function computeExpectedToken(): string {
  return createHmac('sha256', process.env.ADMIN_PASSCODE || '').update('admin-session').digest('hex');
}

export function requireAdmin(request: NextRequest): { user: JwtPayload } | NextResponse {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== computeExpectedToken()) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  return { user: {} };
}
