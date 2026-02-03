/**
 * DigitalOcean Spaces client configuration and utilities
 * Spaces is S3-compatible, so we use AWS SDK
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Environment variable getters (only validated at runtime, not at import time)
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV !== "production") {
    console.warn(`Warning: Missing environment variable: ${key}`);
    return "";
  }
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Lazy initialization - only create client when actually needed
let _spacesClient: S3Client | null = null;

const getSpacesClient = (): S3Client => {
  if (!_spacesClient) {
    _spacesClient = new S3Client({
      endpoint: getEnvVar("DO_SPACES_ENDPOINT"),
      region: getEnvVar("DO_SPACES_REGION"),
      credentials: {
        accessKeyId: getEnvVar("DO_SPACES_ACCESS_KEY_ID"),
        secretAccessKey: getEnvVar("DO_SPACES_SECRET_ACCESS_KEY"),
      },
      forcePathStyle: false, // Required for DigitalOcean Spaces
    });
  }
  return _spacesClient;
};

export const spacesClient = getSpacesClient;

export const SPACES_BUCKET = () => getEnvVar("DO_SPACES_BUCKET");

/**
 * Upload a file to DigitalOcean Spaces
 */
export async function uploadFile(params: {
  key: string;
  body: Buffer;
  contentType: string;
  isPublic?: boolean;
}): Promise<string> {
  const { key, body, contentType, isPublic = true } = params;

  const command = new PutObjectCommand({
    Bucket: SPACES_BUCKET(),
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: isPublic ? "public-read" : "private",
  });

  await spacesClient().send(command);

  // Return the file key (will be converted to pre-signed URL when needed)
  return key;
}

/**
 * Delete a file from DigitalOcean Spaces
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: SPACES_BUCKET(),
    Key: key,
  });

  await spacesClient().send(command);
}

/**
 * Check if a file exists in DigitalOcean Spaces
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: SPACES_BUCKET(),
      Key: key,
    });

    await spacesClient().send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a pre-signed URL for temporary access to a private file
 * Default expiration: 7 days (604800 seconds)
 */
export async function getPresignedUrl(key: string, expiresIn: number = 604800): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: SPACES_BUCKET(),
    Key: key,
  });

  return await getSignedUrl(spacesClient(), command, { expiresIn });
}

/**
 * Get public URL for a file (for files uploaded with public-read ACL)
 */
export function getPublicUrl(key: string): string {
  const bucket = SPACES_BUCKET();
  const region = getEnvVar("DO_SPACES_REGION");
  return `https://${bucket}.${region}.digitaloceanspaces.com/${key}`;
}

/**
 * Extract key from full URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}
