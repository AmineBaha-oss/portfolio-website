/**
 * File upload API endpoint
 * POST /api/admin/upload
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadImage, uploadPDF } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = formData.get("type") as string | null; // 'image' or 'pdf'
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!fileType || !["image", "pdf"].includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Must be 'image' or 'pdf'" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload based on file type
    let result;
    if (fileType === "image") {
      result = await uploadImage({
        file: buffer,
        originalName: file.name,
        contentType: file.type,
        folder: folder || "images",
      });
    } else {
      result = await uploadPDF({
        file: buffer,
        originalName: file.name,
        contentType: file.type,
        folder: folder || "documents",
      });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}
