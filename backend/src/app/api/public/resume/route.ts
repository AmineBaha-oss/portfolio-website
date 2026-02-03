import { NextRequest, NextResponse } from "next/server";
import { db, resumes, resumeDownloads } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { eq } from "drizzle-orm";
import { getPresignedUrl } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang") || "en");

    // Get resume for requested language
    const activeResume = await db
      .select()
      .from(resumes)
      .where(eq(resumes.language, lang))
      .limit(1);

    if (activeResume.length === 0) {
      return NextResponse.json(
        { error: "No active resume found" },
        { status: 404 }
      );
    }

    const resume = activeResume[0];
    
    // Track download
    const trackDownload = searchParams.get("track") === "true";
    if (trackDownload && resume.id) {
      try {
        await db.insert(resumeDownloads).values({
          resumeId: resume.id,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        });
      } catch (error) {
        console.error("Error tracking download:", error);
        // Continue even if tracking fails
      }
    }
    
    // Generate pre-signed URL for secure temporary access
    const presignedUrl = resume.fileKey 
      ? await getPresignedUrl(resume.fileKey)
      : null;
    
    return NextResponse.json({
      filename: resume.filename,
      file_url: presignedUrl,
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}
