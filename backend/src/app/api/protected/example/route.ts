import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return NextResponse.json({ message: "Access granted" });
}
