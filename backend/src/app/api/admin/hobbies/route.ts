import { NextRequest, NextResponse } from "next/server";
import { db, hobbies } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { validateNotEmpty, sanitizeText, validateURL } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const allHobbies = await db
      .select()
      .from(hobbies)
      .orderBy(asc(hobbies.order));
    return NextResponse.json({ hobbies: allHobbies });
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobbies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { title, description, imageUrl, color, order } = body;

    // Validation
    if (!validateNotEmpty(title)) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (imageUrl && !validateURL(imageUrl)) {
      return NextResponse.json(
        { error: "Invalid image URL" },
        { status: 400 }
      );
    }

    // Sanitize
    const sanitizedTitle = sanitizeText(title);
    const sanitizedDescription = description ? sanitizeText(description) : null;
    const orderValue = order ? parseInt(order, 10) : 0;

    const [newHobby] = await db
      .insert(hobbies)
      .values({
        title: sanitizedTitle,
        description: sanitizedDescription,
        imageUrl: imageUrl || null,
        color: color || null,
        order: orderValue,
      })
      .returning();

    return NextResponse.json({ hobby: newHobby }, { status: 201 });
  } catch (error) {
    console.error("Error creating hobby:", error);
    return NextResponse.json(
      { error: "Failed to create hobby" },
      { status: 500 }
    );
  }
}
