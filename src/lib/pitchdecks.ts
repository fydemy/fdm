import path from "path";
import { prisma } from "@/lib/prisma";
import { isMentor, isReviewer } from "@/lib/auth-helpers";
import {
  STORAGE_BUCKETS,
  assertSafeStoragePath,
  downloadStorageObject,
  parseObjectPath,
  parsePitchDeckServeUrl,
  pitchDeckServeUrl,
  uploadStorageObject,
} from "@/lib/supabase-storage";

export function pitchDeckUrlFor(storagePath: string) {
  return pitchDeckServeUrl(storagePath);
}

export async function savePitchDeckFile(input: {
  filename: string;
  userId: string;
  originalName: string;
  data: Buffer;
}) {
  const storagePath = await uploadStorageObject({
    bucket: STORAGE_BUCKETS.pitchdecks,
    userId: input.userId,
    filename: input.filename,
    data: input.data,
    contentType: contentTypeForFilename(input.filename),
    originalName: input.originalName,
  });

  return pitchDeckUrlFor(storagePath);
}

export function readPitchDeckMeta(storagePath: string) {
  const parsed = parseObjectPath(storagePath);
  if (!parsed) return null;
  return { userId: parsed.userId, originalName: parsed.filename };
}

export async function canAccessPitchDeck(input: {
  storagePath: string;
  userId: string;
  role: string;
}) {
  if (!assertSafeStoragePath(input.storagePath)) return false;

  const application = await prisma.application.findFirst({
    where: { pitchDeckUrl: pitchDeckUrlFor(input.storagePath) },
    select: { userId: true, status: true },
  });

  if (application) {
    if (application.userId === input.userId) return true;
    if (isReviewer(input.role)) return true;
    if (isMentor(input.role) && application.status === "APPROVED") return true;
    return false;
  }

  const meta = readPitchDeckMeta(input.storagePath);
  return meta?.userId === input.userId;
}

export async function downloadPitchDeckFile(storagePath: string) {
  return downloadStorageObject(STORAGE_BUCKETS.pitchdecks, storagePath);
}

export function contentTypeForFilename(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".txt":
      return "text/plain";
    case ".md":
      return "text/markdown";
    default:
      return "application/octet-stream";
  }
}

export function resolvePitchDeckStoragePath(url: string) {
  return parsePitchDeckServeUrl(url);
}
