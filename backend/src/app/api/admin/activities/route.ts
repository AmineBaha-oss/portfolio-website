import { NextRequest, NextResponse } from 'next/server';
import { db, activities } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/jwt-verification';
import { ActivityValidationError, parseActivity } from '@/lib/activities/validation';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const rows = await db.select().from(activities).orderBy(activities.order, activities.createdAt);
    return NextResponse.json({ activities: rows }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const data = parseActivity(await request.json());
    const [activity] = await db.insert(activities).values(data).returning();
    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    if (error instanceof ActivityValidationError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 });
    if ((error as { code?: string })?.code === '23503' || (error as { cause?: { code?: string } })?.cause?.code === '23503') return NextResponse.json({ error: 'Linked project does not exist' }, { status: 400 });
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
