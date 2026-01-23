import { NextRequest, NextResponse } from "next/server";
import { db, education } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang")); // For consistency, even though content is single-language

    const educationEntries = await db
      .select()
      .from(education)
      .orderBy(desc(education.startDate), education.order);

    return NextResponse.json({ education: educationEntries });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
      { status: 500 }
    );
  }
}
