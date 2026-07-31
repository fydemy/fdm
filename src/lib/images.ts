import path from "path";
import {
  STORAGE_BUCKETS,
  parsePublicStorageUrl,
  publicObjectUrl,
  uploadStorageObject,
} from "@/lib/supabase-storage";

export const ALLOWED_IMAGE_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
]);

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

// Add ResponsiveImageInfo type for better typing
export interface ResponsiveImageInfo {
  src: string;
  width: number;
  quality?: number;
}

// Function to generate responsive image URLs
export function generateResponsiveImageUrls(baseUrl: string): {
  src: string;
  srcSet: string;
  sizes: string;
} {
  // Generate srcSet for different screen sizes
  const responsiveSizes = [
    { width: 400, suffix: '-sm' },
    { width: 800, suffix: '-md' },
    { width: 1200, suffix: '-lg' },
  ];
  
  const srcSetEntries = responsiveSizes.map(({ width, suffix }) => 
    `${baseUrl.replace(/(\.[^.]+)$/, `${suffix}$1`)} ${width}w`
  );
  
  return {
    src: baseUrl,
    srcSet: srcSetEntries.join(', '),
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };
}

export async function saveImageFile(input: {
  filename: string;
  userId: string;
  originalName: string;
  data: Buffer;
}) {
  const storagePath = await uploadStorageObject({
    bucket: STORAGE_BUCKETS.images,
    userId: input.userId,
    filename: input.filename,
    data: input.data,
    contentType: contentTypeForImage(input.filename),
    originalName: input.originalName,
  });

  return publicObjectUrl(STORAGE_BUCKETS.images, storagePath);
}

export function parseImageUrl(url: string) {
  return parsePublicStorageUrl(url, STORAGE_BUCKETS.images);
}

export function contentTypeForImage(filename: string) {
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
    default:
      return "application/octet-stream";
  }
}
