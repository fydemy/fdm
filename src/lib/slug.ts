import { prisma } from "@/lib/prisma";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueLaunchSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "launch";
  let slug = base;
  let suffix = 2;

  while (
    await prisma.launch.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
