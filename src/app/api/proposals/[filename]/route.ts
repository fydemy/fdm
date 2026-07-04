import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertSafeProposalFilename,
  canAccessProposal,
  contentTypeForFilename,
  proposalFilePath,
  proposalUrlFor,
  readProposalMeta,
} from "@/lib/proposals";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await params;

  if (!assertSafeProposalFilename(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await canAccessProposal({
    filename,
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await readFile(proposalFilePath(filename));
    const application = await prisma.application.findFirst({
      where: {
        OR: [
          { proposalUrl: proposalUrlFor(filename) },
          { proposalUrl: `/uploads/${filename}` },
        ],
      },
      select: { proposalName: true },
    });
    const meta = await readProposalMeta(filename);
    const downloadName =
      application?.proposalName ?? meta?.originalName ?? filename;
    const safeName = downloadName.replace(/"/g, "");

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeForFilename(filename),
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
