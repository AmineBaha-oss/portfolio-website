/**
 * Cloudflare Turnstile server-side verification.
 * Free CAPTCHA alternative: https://developers.cloudflare.com/turnstile/
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not set; skipping CAPTCHA verification.");
    return { success: true };
  }

  if (!token || typeof token !== "string" || token.length > 2048) {
    return { success: false, errorCodes: ["invalid-input"] };
  }

  const body: { secret: string; response: string; remoteip?: string } = {
    secret,
    response: token,
  };
  if (remoteip) body.remoteip = remoteip;

  const res = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
  return {
    success: data.success === true,
    errorCodes: data["error-codes"],
  };
}
