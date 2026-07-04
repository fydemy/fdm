export type EmbedPlatform = "youtube" | "x" | "linkedin" | "instagram";

export type EmbedInfo = {
  platform: EmbedPlatform;
  src: string;
  aspect?: "video" | "post";
};

function hostOf(url: URL) {
  return url.hostname.replace(/^www\./, "").toLowerCase();
}

export function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
  const info = getEmbedInfo(url);
  return info?.platform === "youtube" ? info.src : null;
}

export function getSocialEmbedSrc(url: string): string | null {
  const info = getEmbedInfo(url);
  if (!info) return null;
  return info.src;
}

export function detectEmbedPlatform(
  url: string | null | undefined,
): EmbedPlatform | null {
  return getEmbedInfo(url)?.platform ?? null;
}

export function getEmbedInfo(
  url: string | null | undefined,
): EmbedInfo | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = hostOf(parsed);

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id
        ? {
            platform: "youtube",
            src: `https://www.youtube.com/embed/${id}`,
            aspect: "video",
          }
        : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id =
        parsed.searchParams.get("v") ??
        (() => {
          const parts = parsed.pathname.split("/").filter(Boolean);
          if (
            (parts[0] === "embed" ||
              parts[0] === "shorts" ||
              parts[0] === "live") &&
            parts[1]
          ) {
            return parts[1];
          }
          return null;
        })();

      return id
        ? {
            platform: "youtube",
            src: `https://www.youtube.com/embed/${id}`,
            aspect: "video",
          }
        : null;
    }

    if (host === "twitter.com" || host === "x.com" || host === "mobile.twitter.com") {
      return {
        platform: "x",
        src: `https://twitframe.com/show?url=${encodeURIComponent(url)}`,
        aspect: "post",
      };
    }

    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) {
      const linkedInSrc = getLinkedInEmbedSrc(parsed, url);
      return linkedInSrc
        ? { platform: "linkedin", src: linkedInSrc, aspect: "post" }
        : null;
    }

    if (host === "instagram.com") {
      const path = parsed.pathname.replace(/\/$/, "");
      if (!/^\/(p|reel|tv|reels)\//.test(path)) return null;
      return {
        platform: "instagram",
        src: `https://www.instagram.com${path}/embed`,
        aspect: "post",
      };
    }
  } catch {
    return null;
  }

  return null;
}

function getLinkedInEmbedSrc(parsed: URL, original: string): string | null {
  if (parsed.pathname.includes("/embed/feed/update/")) {
    return original;
  }

  const urnMatch = original.match(/urn:li:(activity|share|ugcPost):\d+/);
  if (urnMatch) {
    return `https://www.linkedin.com/embed/feed/update/${urnMatch[0]}`;
  }

  const activityMatch = parsed.pathname.match(/activity-(\d+)/);
  if (activityMatch) {
    return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityMatch[1]}`;
  }

  const updateMatch = parsed.pathname.match(
    /\/feed\/update\/(urn:li:(?:activity|share|ugcPost):\d+)/,
  );
  if (updateMatch) {
    return `https://www.linkedin.com/embed/feed/update/${updateMatch[1]}`;
  }

  return null;
}

export function isHtmlContent(content: string): boolean {
  const trimmed = content.trimStart();
  return /^<(p|h[1-6]|div|ul|ol|blockquote|pre|figure|hr)\b/i.test(trimmed);
}

export function contentHasText(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return text.length > 0 || html.includes("data-social-embed");
}

export const EMBED_PLATFORM_LABELS: Record<EmbedPlatform, string> = {
  youtube: "YouTube",
  x: "X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
};
