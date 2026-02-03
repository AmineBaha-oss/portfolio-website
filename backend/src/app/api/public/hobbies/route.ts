import { NextRequest, NextResponse } from "next/server";
import { db, hobbies } from "@/lib/db";
import { validateLanguage, extractLanguageFromJsonb } from "@/lib/utils/validation";
import { asc } from "drizzle-orm";
import { getPresignedUrl } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang"));

    const rows = await db
      .select()
      .from(hobbies)
      .orderBy(asc(hobbies.order));

    const hobbiesList = await Promise.all(
      rows.map(async (h) => {
        let imageUrl = h.imageUrl;
        if (h.imageKey) {
          imageUrl = await getPresignedUrl(h.imageKey);
        }
        
        return {
          ...h,
          title: extractLanguageFromJsonb(h.title, lang),
          description: h.description ? extractLanguageFromJsonb(h.description, lang) : null,
          imageUrl,
        };
      })
    );

    return NextResponse.json({ hobbies: hobbiesList });
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobbies" },
      { status: 500 }
    );
  }
}
