export type LinkPreview = {
  title: string;
  favicon: string;
  href: string;
};

const BLOCKED_HOSTS = new Set([
  "localhost",
  "0.0.0.0",
  "127.0.0.1",
  "::1",
  "[::1]",
]);

export function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost")) return null;
    if (isPrivateIpv4(host)) return null;
    return url;
  } catch {
    return null;
  }
}

function isPrivateIpv4(host: string) {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function hostnameFromUrl(href: string) {
  const url = parseHttpUrl(href);
  return url?.hostname.replace(/^www\./, "") ?? href;
}

export function faviconUrlFor(href: string) {
  const host = parseHttpUrl(href)?.hostname;
  if (!host) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num) =>
      String.fromCodePoint(Number.parseInt(num, 10)),
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function extractPageTitle(html: string) {
  const og =
    html.match(
      /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
    );
  if (og?.[1]) return decodeHtmlEntities(og[1]);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title?.[1]) return decodeHtmlEntities(title[1].replace(/<[^>]+>/g, ""));

  return null;
}
