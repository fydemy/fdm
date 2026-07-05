import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const STORAGE_BUCKETS = {
  logos: "logos",
  images: "images",
  pitchdecks: "pitchdecks",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export function objectPath(userId: string, filename: string) {
  return `${userId}/${filename}`;
}

export function publicObjectUrl(bucket: StorageBucket, path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function pitchDeckServeUrl(path: string) {
  return `/api/pitchdecks/${path}`;
}

export function assertSafeStoragePath(path: string) {
  if (!path || path.includes("..") || path.startsWith("/")) return false;
  return /^[a-zA-Z0-9._/-]+$/.test(path);
}

export function parseObjectPath(path: string) {
  const parts = path.split("/");
  if (parts.length !== 2) return null;
  const [userId, filename] = parts;
  if (!userId || !filename) return null;
  return { userId, filename };
}

export function parsePublicStorageUrl(url: string, bucket: StorageBucket) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  const prefix = `${base}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(prefix)) return null;

  const path = url.slice(prefix.length);
  if (!assertSafeStoragePath(path)) return null;
  return parseObjectPath(path);
}

export function parsePitchDeckServeUrl(url: string) {
  if (!url.startsWith("/api/pitchdecks/")) return null;

  const path = url.slice("/api/pitchdecks/".length);
  return assertSafeStoragePath(path) ? path : null;
}

export async function uploadStorageObject(input: {
  bucket: StorageBucket;
  userId: string;
  filename: string;
  data: Buffer;
  contentType: string;
  originalName: string;
}) {
  const supabase = createSupabaseAdmin();
  const path = objectPath(input.userId, input.filename);

  const { error } = await supabase.storage.from(input.bucket).upload(path, input.data, {
    contentType: input.contentType,
    cacheControl: "31536000",
    upsert: false,
    metadata: { originalName: input.originalName },
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function downloadStorageObject(bucket: StorageBucket, path: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
