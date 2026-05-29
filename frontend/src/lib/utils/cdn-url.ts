/**
 * Storage URL utility for Supabase public buckets
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pmapjzgntrpwjvyimxzz.supabase.co";

function getBucketAndPath(key: string): { bucket: string; path: string } {
  if (key.startsWith("resumes/")) {
    return { bucket: "resumes", path: key.slice("resumes/".length) };
  }
  if (key.startsWith("images/")) {
    return { bucket: "images", path: key.slice("images/".length) };
  }
  return { bucket: "images", path: key };
}

/**
 * Get the public Supabase Storage URL for a given key
 */
export function getCdnUrl(key: string): string {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  const { bucket, path } = getBucketAndPath(cleanKey);
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export const DEFAULT_BACKGROUND = getCdnUrl("images/background.jpg");
export const DEFAULT_PROFILE_PICTURE = getCdnUrl("images/pfp.png");

/**
 * Extract the storage key from a full public URL (Supabase or legacy DigitalOcean)
 */
export function extractKeyFromUrl(url: string): string {
  if (!url) return "";

  const supabasePrefix = `${SUPABASE_URL}/storage/v1/object/public/`;
  if (url.startsWith(supabasePrefix)) {
    return url.slice(supabasePrefix.length).split("?")[0];
  }

  const supabaseMatch = url.match(/\.supabase\.co\/storage\/v1\/object\/public\/(.+?)(?:\?|$)/);
  if (supabaseMatch?.[1]) {
    return supabaseMatch[1];
  }

  if (url.includes("digitaloceanspaces.com/")) {
    const parts = url.split("digitaloceanspaces.com/");
    if (parts[1]) {
      return parts[1].split("?")[0];
    }
  }

  return url;
}
