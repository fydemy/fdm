import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import {
  ALLOWED_IMAGE_EXT,
  ALLOWED_IMAGE_TYPES,
  saveImageFile,
} from "@/lib/images";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image must be under 5MB" },
      { status: 400 },
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXT.has(ext) || (file.type && !ALLOWED_IMAGE_TYPES.has(file.type))) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, or GIF images are allowed" },
      { status: 400 },
    );
  }

  const filename = `${randomUUID()}${ext}`;

  const url = await saveImageFile({
    filename,
    userId: user.id,
    originalName: file.name,
    data: Buffer.from(await file.arrayBuffer()),
  });

  return NextResponse.json({
    url,
    name: file.name,
  });
}
