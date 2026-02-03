import { NextRequest, NextResponse } from "next/server";
import { db, resumeDownloads } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { sql, gte } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get total downloads
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(resumeDownloads);
    
    // Get downloads this month
    const monthResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(resumeDownloads)
      .where(gte(resumeDownloads.downloadedAt, startOfMonth));
    
    // Get downloads today
    const todayResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(resumeDownloads)
      .where(gte(resumeDownloads.downloadedAt, startOfDay));

    return NextResponse.json({
      total: totalResult[0]?.count || 0,
      thisMonth: monthResult[0]?.count || 0,
      today: todayResult[0]?.count || 0,
    });
  } catch (error) {
    console.error("Error fetching resume stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume statistics" },
      { status: 500 }
    );
  }
}
