import nodemailer from "nodemailer";

const TO_EMAIL = process.env.TESTIMONIAL_NOTIFY_EMAIL ?? "aminebaha115@gmail.com";
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function getTransport() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

export type TestimonialPayload = {
  name: string;
  position: string;
  company: string | null;
  email: string;
  message: string;
  rating: number;
};

/**
 * Send a notification email when a new testimonial is submitted.
 * Uses Gmail SMTP (set GMAIL_USER and GMAIL_APP_PASSWORD in env).
 * No-op if env is not set.
 */
export async function sendTestimonialNotification(payload: TestimonialPayload): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("Email not configured: set GMAIL_USER and GMAIL_APP_PASSWORD to receive testimonial notifications.");
    return;
  }

  const companyLine = payload.company ? `Company: ${payload.company}\n` : "";
  const body = `
New testimonial submission

Name: ${payload.name}
Position: ${payload.position}
${companyLine}Email: ${payload.email}
Rating: ${payload.rating}/5

Message:
${payload.message}
`.trim();

  await transport.sendMail({
    from: GMAIL_USER,
    to: TO_EMAIL,
    subject: `[Portfolio] New testimonial from ${payload.name}`,
    text: body,
  });
}

export type ContactMessagePayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Send a notification email when a new contact form message is submitted.
 * Uses same Gmail SMTP and same recipient as testimonial notifications.
 */
export async function sendContactMessageNotification(payload: ContactMessagePayload): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("Email not configured: set GMAIL_USER and GMAIL_APP_PASSWORD to receive contact message notifications.");
    return;
  }

  const body = `
New contact form message

From: ${payload.name}
Email: ${payload.email}
Subject: ${payload.subject}

Message:
${payload.message}
`.trim();

  await transport.sendMail({
    from: GMAIL_USER,
    to: TO_EMAIL,
    subject: `[Portfolio] Contact: ${payload.subject}`,
    text: body,
  });
}
