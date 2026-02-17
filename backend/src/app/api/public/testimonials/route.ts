import { NextRequest, NextResponse } from "next/server";
import { db, testimonials } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { eq, and } from "drizzle-orm";
import { desc } from "drizzle-orm";
import {
  validateEmail,
  sanitizeText,
  validateNotEmpty,
  validateRating,
} from "@/lib/utils/validation";
import { checkDailyRateLimit, getClientIdentifier } from "@/lib/utils/rate-limit";
import { sendTestimonialNotification } from "@/lib/utils/email";
import { verifyTurnstileToken } from "@/lib/utils/turnstile";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang")); // For consistency

    // Only return approved and active testimonials
    const approvedTestimonials = await db
      .select()
      .from(testimonials)
      .where(and(eq(testimonials.status, "approved"), eq(testimonials.active, true)))
      .orderBy(desc(testimonials.submittedAt));

    return NextResponse.json({ testimonials: approvedTestimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const { allowed, retryAfterSeconds } = checkDailyRateLimit(`testimonials:${clientId}`);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Daily limit for testimonial submissions reached. Please try again tomorrow.",
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds ?? 60),
          },
        }
      );
    }

    const body = await request.json();
    const { name, position, company, email, message, rating, captchaToken } = body;

    // CAPTCHA (Turnstile) verification
    if (process.env.TURNSTILE_SECRET_KEY) {
      const { success } = await verifyTurnstileToken(captchaToken ?? "", getClientIdentifier(request));
      if (!success) {
        return NextResponse.json(
          { error: "CAPTCHA verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    // Validation
    if (!validateNotEmpty(name)) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(position)) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(message)) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const MESSAGE_MAX_LENGTH = 500;
    if (message.length > MESSAGE_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Testimonial message must be at most ${MESSAGE_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!validateRating(rating)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeText(name);
    const sanitizedPosition = sanitizeText(position);
    const sanitizedCompany = company ? sanitizeText(company) : null;
    const sanitizedMessage = sanitizeText(message);

    // Insert testimonial with pending status
    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        name: sanitizedName,
        position: sanitizedPosition,
        company: sanitizedCompany,
        email: email.trim().toLowerCase(),
        message: sanitizedMessage,
        rating: parseInt(rating, 10),
        status: "pending",
      })
      .returning();

    // Notify by email (fire-and-forget; don't fail the request if email fails)
    sendTestimonialNotification({
      name: sanitizedName,
      position: sanitizedPosition,
      company: sanitizedCompany,
      email: email.trim().toLowerCase(),
      message: sanitizedMessage,
      rating: parseInt(rating, 10),
    }).catch((err) => console.error("Testimonial notification email failed:", err));

    return NextResponse.json({
      success: true,
      message: "Testimonial submitted successfully. It will be reviewed before publication.",
      id: newTestimonial.id,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
