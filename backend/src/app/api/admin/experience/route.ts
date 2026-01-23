import { NextRequest, NextResponse } from "next/server";
import { db, workExperience } from "@/lib/db";
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
    const allExperience = await db
      .select()
      .from(workExperience)
      .orderBy(desc(workExperience.startDate), workExperience.order);
    return NextResponse.json({ experiences: allExperience });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experience" },
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
    const { position, company, location, description, startDate, endDate, current, order } = body;

    // Validation
    if (!validateNotEmpty(position)) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(company)) {
      return NextResponse.json(
        { error: "Company is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(location)) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(description)) {
      return NextResponse.json(
        { error: "Description is required" },
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
    const sanitizedPosition = sanitizeText(position);
    const sanitizedCompany = sanitizeText(company);
    const sanitizedLocation = sanitizeText(location);
    const sanitizedDescription = sanitizeText(description);
    const isCurrent = current === true;
    const orderValue = order ? parseInt(order, 10) : 0;

    const [newExperience] = await db
      .insert(workExperience)
      .values({
        position: sanitizedPosition,
        company: sanitizedCompany,
        location: sanitizedLocation,
        description: sanitizedDescription,
        startDate,
        endDate: endDate || null,
        current: isCurrent,
        order: orderValue,
      })
      .returning();

    return NextResponse.json({ experience: newExperience }, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create work experience" },
      { status: 500 }
    );
  }
}
