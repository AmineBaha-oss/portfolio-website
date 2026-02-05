/**
 * CDN URL utility for DigitalOcean Spaces
 * Centralizes CDN base URL configuration to avoid hardcoded URLs
 */

// Use environment variable with fallback to default DigitalOcean Spaces URL
export const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_URL ||
  "https://portfolio-app.nyc3.digitaloceanspaces.com";

// Default images
export const DEFAULT_BACKGROUND = `${CDN_BASE_URL}/images/background.jpg`;
export const DEFAULT_PROFILE_PICTURE = `${CDN_BASE_URL}/images/pfp.png`;

/**
 * Get the full CDN URL for a given key
 * @param key - The object key (path) in the CDN bucket
 * @returns Full CDN URL
 */
export function getCdnUrl(key: string): string {
  if (!key) return "";
  // If it's already a full URL, return as-is
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  // Remove leading slash if present
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${CDN_BASE_URL}/${cleanKey}`;
}

/**
 * Extract the key from a full CDN URL
 * @param url - Full CDN URL
 * @returns The object key (path) or empty string if invalid
 */
export function extractKeyFromUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith(CDN_BASE_URL)) {
    return url.slice(CDN_BASE_URL.length + 1); // +1 for the trailing slash
  }
  return url;
}
