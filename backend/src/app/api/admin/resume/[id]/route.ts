import { NextRequest, NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { validateUUID } from "@/lib/utils/validation";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    if (!validateUUID(id)) {
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
    }

    // Check if resume exists
    const [existingResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id))
      .limit(1);

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Delete file from storage if it exists
    if (existingResume.fileKey) {
      try {
        await deleteFile(existingResume.fileKey);
      } catch (error) {
        console.error("Error deleting file from storage:", error);
        // Continue with database deletion even if file deletion fails
      }
    }

    await db.delete(resumes).where(eq(resumes.id, id));

    return NextResponse.json({ success: true, message: "Resume deleted" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
