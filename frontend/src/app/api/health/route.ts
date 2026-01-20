import { NextResponse } from "next/server";

/**
 * Health check endpoint for frontend service
 */
export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    service: "portfolio-frontend",
    timestamp: new Date().toISOString()
  });
}
