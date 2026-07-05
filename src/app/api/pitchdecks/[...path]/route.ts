import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSafeStoragePath } from "@/lib/supabase-storage";
import {
  canAccessPitchDeck,
  contentTypeForFilename,
  downloadPitchDeckFile,
  pitchDeckUrlFor,
} from "@/lib/pitchdecks";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: segments } = await params;
  const storagePath = segments.join("/");

  if (!assertSafeStoragePath(storagePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await canAccessPitchDeck({
    storagePath,
    userId: user.id,
    role: user.role,
  });

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const blob = await downloadPitchDeckFile(storagePath);
    const data = Buffer.from(await blob.arrayBuffer());
    const filename = storagePath.split("/").pop() ?? storagePath;

    const application = await prisma.application.findFirst({
      where: { pitchDeckUrl: pitchDeckUrlFor(storagePath) },
      select: { pitchDeckName: true },
    });

    const downloadName = application?.pitchDeckName ?? filename;
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
