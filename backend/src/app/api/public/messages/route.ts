import { NextRequest, NextResponse } from "next/server";
import { db, contactMessages } from "@/lib/db";
import { validateEmail, sanitizeText, validateNotEmpty } from "@/lib/utils/validation";
import { checkRateLimit, getClientIdentifier } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`messages:${clientId}`);
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Too many messages sent. Please try again later.",
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
    const { name, email, subject, message } = body;

    // Validation
    if (!validateNotEmpty(name)) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(subject)) {
      return NextResponse.json(
        { error: "Subject is required" },
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
        { error: `Message must be at most ${MESSAGE_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeText(name);
    const sanitizedSubject = sanitizeText(subject);
    const sanitizedMessage = sanitizeText(message);

    // Insert message
    const [newMessage] = await db
      .insert(contactMessages)
      .values({
        name: sanitizedName,
        email: email.trim().toLowerCase(),
        subject: sanitizedSubject,
        message: sanitizedMessage,
        status: "unread",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      id: newMessage.id,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
