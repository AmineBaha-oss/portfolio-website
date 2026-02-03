/**
 * File upload helper utilities
 */

import { uploadFile, deleteFile, extractKeyFromUrl } from "./spaces-client";

/**
 * Allowed file types for different upload categories
 */
export const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  pdf: ["application/pdf"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  pdf: 10 * 1024 * 1024, // 10MB
  document: 10 * 1024 * 1024, // 10MB
};

/**
 * Validate file type and size
 */
export function validateFile(params: {
  fileType: string;
  fileSize: number;
  allowedTypes: string[];
  maxSize: number;
}): { valid: boolean; error?: string } {
  const { fileType, fileSize, allowedTypes, maxSize } = params;

  if (!allowedTypes.includes(fileType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  if (fileSize > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate a unique file key for storage
 */
export function generateFileKey(params: {
  folder: string;
  originalName: string;
  userId?: string;
}): string {
  const { folder, originalName, userId } = params;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const userPrefix = userId ? `${userId}_` : "";

  return `${folder}/${userPrefix}${timestamp}_${random}_${sanitizedName}`;
}

/**
 * Upload an image file
 */
export async function uploadImage(params: {
  file: Buffer;
  originalName: string;
  contentType: string;
  folder?: string;
  userId?: string;
}): Promise<{ url: string; key: string }> {
  const { file, originalName, contentType, folder = "images", userId } = params;

  // Validate file
  const validation = validateFile({
    fileType: contentType,
    fileSize: file.length,
    allowedTypes: ALLOWED_FILE_TYPES.image,
    maxSize: MAX_FILE_SIZES.image,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate key and upload
  const key = generateFileKey({ folder, originalName, userId });
  await uploadFile({
    key,
    body: file,
    contentType,
  });

  return { url: key, key }; // url is the key, will be converted to presigned URL when needed
}

/**
 * Upload a PDF file (e.g., resume)
 */
export async function uploadPDF(params: {
  file: Buffer;
  originalName: string;
  contentType: string;
  folder?: string;
  userId?: string;
}): Promise<{ url: string; key: string }> {
  const { file, originalName, contentType, folder = "documents", userId } = params;

  // Validate file
  const validation = validateFile({
    fileType: contentType,
    fileSize: file.length,
    allowedTypes: ALLOWED_FILE_TYPES.pdf,
    maxSize: MAX_FILE_SIZES.pdf,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate key and upload
  const key = generateFileKey({ folder, originalName, userId });
  await uploadFile({
    key,
    body: file,
    contentType,
  });

  return { url: key, key }; // url is the key, will be converted to presigned URL when needed
}

/**
 * Replace an existing file (delete old, upload new)
 */
export async function replaceFile(params: {
  oldUrl: string | null;
  newFile: Buffer;
  originalName: string;
  contentType: string;
  folder: string;
  userId?: string;
  fileType: "image" | "pdf";
}): Promise<{ url: string; key: string }> {
  const { oldUrl, newFile, originalName, contentType, folder, userId, fileType } = params;

  // Delete old file if it exists
  if (oldUrl) {
    const oldKey = extractKeyFromUrl(oldUrl);
    if (oldKey) {
      try {
        await deleteFile(oldKey);
      } catch (error) {
        console.error("Error deleting old file:", error);
        // Continue with upload even if delete fails
      }
    }
  }

  // Upload new file
  if (fileType === "image") {
    return await uploadImage({ file: newFile, originalName, contentType, folder, userId });
  } else {
    return await uploadPDF({ file: newFile, originalName, contentType, folder, userId });
  }
}
