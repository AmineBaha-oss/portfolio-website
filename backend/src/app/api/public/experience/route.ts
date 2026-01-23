import { NextRequest, NextResponse } from "next/server";
import { db, workExperience } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang")); // For consistency, even though content is single-language

    const experiences = await db
      .select()
      .from(workExperience)
      .orderBy(desc(workExperience.startDate), workExperience.order);

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experience" },
      { status: 500 }
    );
  }
}
