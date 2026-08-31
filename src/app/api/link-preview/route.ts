import { NextRequest, NextResponse } from "next/server";
import {
  extractPageTitle,
  faviconUrlFor,
  hostnameFromUrl,
  parseHttpUrl,
} from "@/lib/link-preview";

const TIMEOUT_MS = 5000;
const MAX_BYTES = 80_000;
const cache = new Map<string, { title: string; favicon: string; at: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url") ?? "";
  const url = parseHttpUrl(raw);
  if (!url) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const href = url.toString();
  const cached = cache.get(href);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({
      title: cached.title,
      favicon: cached.favicon,
      href,
    });
  }

  const favicon = faviconUrlFor(href);
  const fallbackTitle = hostnameFromUrl(href);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; FydemyLinkPreview/1.0; +https://fydemy.com)",
      },
    });
    clearTimeout(timer);

    const contentType = res.headers.get("content-type") ?? "";
    let title = fallbackTitle;
    if (res.ok && contentType.includes("html")) {
      const reader = res.body?.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      if (reader) {
        while (received < MAX_BYTES) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          chunks.push(value);
          received += value.byteLength;
        }
        reader.cancel().catch(() => {});
      }
      const html = new TextDecoder("utf-8", { fatal: false }).decode(
        concatBytes(chunks),
      );
      title = extractPageTitle(html) || fallbackTitle;
    }

    const payload = { title, favicon, href };
    cache.set(href, { ...payload, at: Date.now() });
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ title: fallbackTitle, favicon, href });
  }
}

function concatBytes(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
