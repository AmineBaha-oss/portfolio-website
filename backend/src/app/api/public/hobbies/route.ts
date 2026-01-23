import { NextRequest, NextResponse } from "next/server";
import { db, hobbies } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang")); // For consistency, even though content is single-language

    const hobbiesList = await db
      .select()
      .from(hobbies)
      .orderBy(asc(hobbies.order));

    return NextResponse.json({ hobbies: hobbiesList });
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobbies" },
      { status: 500 }
    );
  }
}
