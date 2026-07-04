import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import {
  assertSafeLogoFilename,
  contentTypeForLogo,
  logoFilePath,
} from "@/lib/logos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (!assertSafeLogoFilename(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const data = await readFile(logoFilePath(filename));
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeForLogo(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
