import { NextRequest, NextResponse } from "next/server";
import { db, hobbies } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import {
  validateNotEmpty,
  sanitizeText,
  validateURL,
  validateUUID,
} from "@/lib/utils/validation";

export async function PUT(
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
      return NextResponse.json({ error: "Invalid hobby ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if hobby exists
    const [existingHobby] = await db
      .select()
      .from(hobbies)
      .where(eq(hobbies.id, id))
      .limit(1);

    if (!existingHobby) {
      return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};

    if (body.title !== undefined) {
      if (!validateNotEmpty(body.title)) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = sanitizeText(body.title);
    }

    if (body.description !== undefined) {
      updateData.description = body.description ? sanitizeText(body.description) : null;
    }

    if (body.imageUrl !== undefined) {
      if (body.imageUrl && !validateURL(body.imageUrl)) {
        return NextResponse.json(
          { error: "Invalid image URL" },
          { status: 400 }
        );
      }
      updateData.imageUrl = body.imageUrl || null;
    }

    if (body.color !== undefined) {
      updateData.color = body.color || null;
    }

    if (body.order !== undefined) {
      updateData.order = parseInt(body.order, 10);
    }

    updateData.updatedAt = new Date();

    const [updatedHobby] = await db
      .update(hobbies)
      .set(updateData)
      .where(eq(hobbies.id, id))
      .returning();

    return NextResponse.json({ hobby: updatedHobby });
  } catch (error) {
    console.error("Error updating hobby:", error);
    return NextResponse.json(
      { error: "Failed to update hobby" },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ error: "Invalid hobby ID" }, { status: 400 });
    }

    // Check if hobby exists
    const [existingHobby] = await db
      .select()
      .from(hobbies)
      .where(eq(hobbies.id, id))
      .limit(1);

    if (!existingHobby) {
      return NextResponse.json({ error: "Hobby not found" }, { status: 404 });
    }

    await db.delete(hobbies).where(eq(hobbies.id, id));

    return NextResponse.json({ success: true, message: "Hobby deleted" });
  } catch (error) {
    console.error("Error deleting hobby:", error);
    return NextResponse.json(
      { error: "Failed to delete hobby" },
      { status: 500 }
    );
  }
}
