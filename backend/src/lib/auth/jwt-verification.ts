import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export interface JwtPayload {
  sub: string; // user id
  email: string;
  name?: string;
  role?: string;
  locale?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}

/**
 * Verify JWT token from Authorization header
 * Returns the decoded payload if valid, null otherwise
 */
export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    const jwtSecret = process.env.AUTH_JWT_SECRET;
    
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error("JWT secret is missing or too short");
      return null;
    }

    const issuer = process.env.AUTH_JWT_ISS || "portfolio-auth";
    const audience = process.env.AUTH_JWT_AUD || "portfolio-api";

    const decoded = jwt.verify(token, jwtSecret, {
      issuer,
      audience,
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("JWT verification error:", error);
    }
    return null;
  }
}

/**
 * Extract JWT token from Authorization header or cookies
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // First, try to get token from Authorization header
  const authHeader = request.headers.get("authorization");
  
  if (authHeader) {
    console.log("Found Authorization header");
    // Support both "Bearer <token>" and just "<token>"
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    return authHeader;
  }

  // If not in header, try to get from cookies
  // Better Auth stores JWT token in cookies by default
  const cookieHeader = request.headers.get("cookie");
  console.log("Cookie header:", cookieHeader);
  
  if (cookieHeader) {
    // Parse cookies
    const cookies = cookieHeader.split(";").map(c => c.trim());
    console.log("All cookies:", cookies);
    
    // Look for better-auth token cookie
    // Better Auth typically uses 'better-auth.session_token' or similar
    for (const cookie of cookies) {
      if (cookie.startsWith("better-auth.session_token=")) {
        console.log("Found better-auth.session_token");
        return cookie.substring("better-auth.session_token=".length);
      }
      // Also check for just 'session_token'
      if (cookie.startsWith("session_token=")) {
        console.log("Found session_token");
        return cookie.substring("session_token=".length);
      }
    }
  }
  
  console.log("No token found in request");
  return null;
}

/**
 * Get authenticated user from request
 * Returns user payload if token is valid, null otherwise
 */
export function getAuthenticatedUser(request: NextRequest): JwtPayload | null {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    return null;
  }

  return verifyJwtToken(token);
}

/**
 * Middleware helper to check if user is authenticated
 * Returns NextResponse with error if not authenticated, null if authenticated
 */
export function requireAuth(request: NextRequest): { user: JwtPayload } | NextResponse {
  const user = getAuthenticatedUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Middleware helper to check if user has ADMIN role
 * Returns NextResponse with error if not admin, null if admin
 */
export function requireAdmin(request: NextRequest): { user: JwtPayload } | NextResponse {
  const authResult = requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Not authenticated
  }

  const { user } = authResult;
  const role = user.role?.toUpperCase();

  if (role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  return { user };
}
