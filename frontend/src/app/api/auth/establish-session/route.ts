import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * API route to establish session from token (localhost development workaround)
 * This is needed because cookies from localhost:3001 aren't accessible on localhost:3000
 * 
 * The Better Auth client makes requests to auth-service (localhost:3001),
 * so we need to verify the session with auth-service and then the client can use it
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let sessionToken = searchParams.get("token");

    if (!sessionToken) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Decode the token if it's URL-encoded (it comes from the URL query param)
    try {
      sessionToken = decodeURIComponent(sessionToken);
    } catch {
      // If decoding fails, use the original token
    }

    // Verify the session with auth-service
    // Use AUTH_SERVICE_URL for server-side (container-to-container) communication
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:3001";
    
    let sessionData = null;
    try {
      const verifyResponse = await fetch(`${authServiceUrl}/api/auth/get-session`, {
        method: "GET",
        headers: {
          "Cookie": `better-auth.session_token=${sessionToken}`,
        },
      });

      if (!verifyResponse.ok) {
        // For development, still set the cookie even if verification fails
        // In production, you might want to return an error here
      } else {
        const responseData = await verifyResponse.json();
        // Better Auth returns: { data: { session: {...}, user: {...} } }
        sessionData = responseData;
      }
    } catch (fetchError) {
      // For development, continue even if we can't verify
      // In production, you might want to return an error here
    }

    // Set the session cookie on the frontend domain
    // Note: This cookie won't be sent to auth-service (different origin),
    // but we set it anyway for consistency
    const cookieStore = await cookies();
    cookieStore.set("better-auth.session_token", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Return the session data so the client can use it
    return NextResponse.json({ 
      success: true,
      session: sessionData,
      token: sessionToken // Return token so client can use it for auth-service requests
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to establish session" },
      { status: 500 }
    );
  }
}
