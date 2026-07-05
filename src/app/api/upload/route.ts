import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { proposalUrlFor, saveProposalFile } from "@/lib/proposals";
import { isStaff } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
]);

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

  if (isStaff(user.role)) {
    return NextResponse.json(
      { error: "Workspace access is not available to staff accounts" },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  if (file.type && !ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, Word, text, or markdown files are allowed" },
      { status: 400 },
    );
  }

  const ext = path.extname(file.name) || ".bin";
  const filename = `${randomUUID()}${ext}`;

  await saveProposalFile({
    filename,
    userId: user.id,
    originalName: file.name,
    data: Buffer.from(await file.arrayBuffer()),
  });

  return NextResponse.json({
    url: proposalUrlFor(filename),
    name: file.name,
  });
}
