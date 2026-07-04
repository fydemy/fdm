import path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";

export const LOGOS_DIR = path.join(process.cwd(), "storage", "logos");

type LogoMeta = {
  userId: string;
  originalName: string;
};

export function logoUrlFor(filename: string) {
  return `/api/logos/${filename}`;
}

export function assertSafeLogoFilename(filename: string) {
  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return false;
  }
  return /^[a-zA-Z0-9._-]+$/.test(filename);
}

export function logoFilePath(filename: string) {
  return path.join(LOGOS_DIR, filename);
}

function logoMetaPath(filename: string) {
  return path.join(LOGOS_DIR, `${filename}.meta.json`);
}

export async function saveLogoFile(input: {
  filename: string;
  userId: string;
  originalName: string;
  data: Buffer;
}) {
  await mkdir(LOGOS_DIR, { recursive: true });
  await writeFile(logoFilePath(input.filename), input.data);
  const meta: LogoMeta = {
    userId: input.userId,
    originalName: input.originalName,
  };
  await writeFile(logoMetaPath(input.filename), JSON.stringify(meta));
}

export async function readLogoMeta(
  filename: string,
): Promise<LogoMeta | null> {
  try {
    const raw = await readFile(logoMetaPath(filename), "utf8");
    return JSON.parse(raw) as LogoMeta;
  } catch {
    return null;
  }
}

export function contentTypeForLogo(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
