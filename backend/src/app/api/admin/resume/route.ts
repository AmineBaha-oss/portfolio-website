import { NextRequest, NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { validateNotEmpty, sanitizeText } from "@/lib/utils/validation";
import {
  uploadPDF,
  deleteFile,
  extractKeyFromUrl,
  getPublicUrl,
} from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get("lang");

    // Get resume for specific language
    if (lang) {
      const [resume] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.language, lang))
        .limit(1);

      if (!resume) {
        return NextResponse.json({ resume: null });
      }

      // Return public URL
      const publicUrl = resume.fileKey
        ? getPublicUrl(resume.fileKey)
        : resume.fileUrl;

      return NextResponse.json({
        resume: {
          ...resume,
          fileUrl: publicUrl,
        },
      });
    }

    // Get all resumes
    const resumeList = await db.select().from(resumes);
    return NextResponse.json({ resumes: resumeList });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const language = (formData.get("language") as string) || "en";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // Check if there's an active resume for this language
    const [activeResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.language, language))
      .limit(1);

    // Delete old file if exists
    if (activeResume?.fileKey) {
      try {
        await deleteFile(activeResume.fileKey);
      } catch (error) {
        console.error("Error deleting old resume:", error);
        // Continue with upload
      }
    }

    // Convert file to buffer and upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await uploadPDF({
      file: buffer,
      originalName: file.name,
      contentType: file.type,
      folder: "resumes",
    });

    // If there was an active resume for this language, update it; otherwise create new
    if (activeResume) {
      const [updatedResume] = await db
        .update(resumes)
        .set({
          filename: sanitizeText(file.name),
          fileUrl: uploadResult.url,
          fileKey: uploadResult.key,
          fileSize: file.size,
          language,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, activeResume.id))
        .returning();

      // Return public URL
      const publicUrl = getPublicUrl(updatedResume.fileKey!);

      return NextResponse.json({
        resume: {
          ...updatedResume,
          fileUrl: publicUrl,
        },
      });
    } else {
      const [newResume] = await db
        .insert(resumes)
        .values({
          filename: sanitizeText(file.name),
          fileUrl: uploadResult.url,
          fileKey: uploadResult.key,
          fileSize: file.size,
          language,
          isActive: true,
        })
        .returning();

      // Return public URL
      const publicUrl = getPublicUrl(newResume.fileKey!);

      return NextResponse.json(
        {
          resume: {
            ...newResume,
            fileUrl: publicUrl,
          },
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update resume",
      },
      { status: 500 },
    );
  }
}
