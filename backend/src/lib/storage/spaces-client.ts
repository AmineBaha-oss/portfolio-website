import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

function getBucketAndPath(key: string): { bucket: string; path: string } {
  if (key.startsWith("resumes/")) return { bucket: "resumes", path: key.slice("resumes/".length) };
  if (key.startsWith("images/")) return { bucket: "images", path: key.slice("images/".length) };
  return { bucket: "images", path: key };
}

export async function uploadFile(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const { key, body, contentType } = params;
  const { bucket, path } = getBucketAndPath(key);
  const { error } = await getSupabase().storage.from(bucket).upload(path, body, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return key;
}

export async function deleteFile(key: string): Promise<void> {
  const { bucket, path } = getBucketAndPath(key);
  const { error } = await getSupabase().storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function fileExists(key: string): Promise<boolean> {
  const { bucket, path } = getBucketAndPath(key);
  const { data } = await getSupabase().storage.from(bucket).list("", { search: path });
  return (data ?? []).some((f) => f.name === path);
}

export function getPublicUrl(key: string): string {
  const { bucket, path } = getBucketAndPath(key);
  const { data } = getSupabase().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getPresignedUrl(key: string): Promise<string> {
  return getPublicUrl(key);
}

export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}
