import { NextResponse } from "next/server";

// Removed — auth is now passcode-based via /api/admin-auth
export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
