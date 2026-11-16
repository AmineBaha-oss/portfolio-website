import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, activities, projects } from '@/lib/db';
import { validateLanguage, extractLanguageFromJsonb } from '@/lib/utils/validation';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const lang = validateLanguage(request.nextUrl.searchParams.get('lang'));
    const rows = await db.select({ activity: activities, projectStatus: projects.status }).from(activities).leftJoin(projects, eq(activities.projectId, projects.id)).where(eq(activities.published, true)).orderBy(activities.order, activities.createdAt);
    const localized = rows.map(({ activity: row, projectStatus }) => ({
      ...row,
      projectId: projectStatus === 'published' ? row.projectId : null,
      title: extractLanguageFromJsonb(row.title, lang),
      description: extractLanguageFromJsonb(row.description, lang),
      period: extractLanguageFromJsonb(row.period, lang),
      organization: extractLanguageFromJsonb(row.organization, lang),
      location: extractLanguageFromJsonb(row.location, lang),
    }));
    return NextResponse.json({ activities: localized }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching public activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
