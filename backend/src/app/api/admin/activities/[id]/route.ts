import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, activities } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/jwt-verification';
import { validateUUID } from '@/lib/utils/validation';
import { ActivityValidationError, parseActivity } from '@/lib/activities/validation';

type Context = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, { params }: Context) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!validateUUID(id)) return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  try {
    const data = parseActivity(await request.json());
    const [activity] = await db.update(activities).set({ ...data, updatedAt: new Date() }).where(eq(activities.id, id)).returning();
    if (!activity) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    return NextResponse.json({ activity });
  } catch (error) {
    if (error instanceof ActivityValidationError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 });
    if ((error as { code?: string })?.code === '23503' || (error as { cause?: { code?: string } })?.cause?.code === '23503') return NextResponse.json({ error: 'Linked project does not exist' }, { status: 400 });
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest, { params }: Context) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!validateUUID(id)) return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  try {
    const [deleted] = await db.delete(activities).where(eq(activities.id, id)).returning({ id: activities.id });
    if (!deleted) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}
