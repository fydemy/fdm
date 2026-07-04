import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { logoUrlFor, saveLogoFile } from "@/lib/logos";
import { isReviewer } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isReviewer(user.email, user.role)) {
    return NextResponse.json(
      { error: "Workspace access is not available to reviewers" },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Logo must be under 2MB" },
      { status: 400 },
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext) || (file.type && !ALLOWED.has(file.type))) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, GIF, or SVG logos are allowed" },
      { status: 400 },
    );
  }

  const filename = `${randomUUID()}${ext}`;

  await saveLogoFile({
    filename,
    userId: user.id,
    originalName: file.name,
    data: Buffer.from(await file.arrayBuffer()),
  });

  return NextResponse.json({
    url: logoUrlFor(filename),
    name: file.name,
  });
}
