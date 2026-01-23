import { NextRequest, NextResponse } from "next/server";
import { db, education } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { validateNotEmpty, sanitizeText, validateDate } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const allEducation = await db
      .select()
      .from(education)
      .orderBy(desc(education.startDate), education.order);
    return NextResponse.json({ education: allEducation });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
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
    const { degree, institution, location, description, startDate, endDate, gpa, order } = body;

    // Validation
    if (!validateNotEmpty(degree)) {
      return NextResponse.json(
        { error: "Degree is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(institution)) {
      return NextResponse.json(
        { error: "Institution is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(location)) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    if (!validateDate(startDate)) {
      return NextResponse.json(
        { error: "Valid start date is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (endDate && !validateDate(endDate)) {
      return NextResponse.json(
        { error: "Invalid end date format (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Sanitize
    const sanitizedDegree = sanitizeText(degree);
    const sanitizedInstitution = sanitizeText(institution);
    const sanitizedLocation = sanitizeText(location);
    const sanitizedDescription = description ? sanitizeText(description) : null;
    const sanitizedGpa = gpa ? sanitizeText(gpa) : null;
    const orderValue = order ? parseInt(order, 10) : 0;

    const [newEducation] = await db
      .insert(education)
      .values({
        degree: sanitizedDegree,
        institution: sanitizedInstitution,
        location: sanitizedLocation,
        description: sanitizedDescription,
        startDate,
        endDate: endDate || null,
        gpa: sanitizedGpa,
        order: orderValue,
      })
      .returning();

    return NextResponse.json({ education: newEducation }, { status: 201 });
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json(
      { error: "Failed to create education entry" },
      { status: 500 }
    );
  }
}
