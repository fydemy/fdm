"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  faviconUrlFor,
  hostnameFromUrl,
  parseHttpUrl,
  type LinkPreview,
} from "@/lib/link-preview";
import { cn } from "@/lib/utils";

const previewCache = new Map<string, LinkPreview>();
const inflight = new Map<string, Promise<LinkPreview | null>>();

export async function fetchLinkPreview(href: string): Promise<LinkPreview | null> {
  const url = parseHttpUrl(href);
  if (!url) return null;
  const key = url.toString();
  const cached = previewCache.get(key);
  if (cached) return cached;
  const pending = inflight.get(key);
  if (pending) return pending;

  const request = fetch(`/api/link-preview?url=${encodeURIComponent(key)}`)
    .then(async (res) => {
      if (!res.ok) return null;
      const data = (await res.json()) as Partial<LinkPreview>;
      if (!data.title) return null;
      const preview: LinkPreview = {
        title: data.title,
        favicon: data.favicon || faviconUrlFor(key),
        href: data.href || key,
      };
      previewCache.set(key, preview);
      return preview;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}

export function LinkBadge({
  href,
  title,
  className,
}: {
  href: string;
  title?: string | null;
  className?: string;
}) {
  const fallback = title?.trim() || hostnameFromUrl(href);
  const [label, setLabel] = useState(fallback);
  const [favicon, setFavicon] = useState(faviconUrlFor(href));
  const [iconFailed, setIconFailed] = useState(!favicon);

  useEffect(() => {
    setLabel(fallback);
    setFavicon(faviconUrlFor(href));
    setIconFailed(!faviconUrlFor(href));
    void fetchLinkPreview(href).then((preview) => {
      if (!preview) return;
      setLabel(preview.title);
      if (preview.favicon) {
        setFavicon(preview.favicon);
        setIconFailed(false);
      }
    });
  }, [href, fallback]);

  return (
    <Badge
      variant="secondary"
      render={
        <a href={href} target="_blank" rel="noopener noreferrer" />
      }
      className={cn(
        "not-prose my-0.5 h-6 max-w-[min(100%,16rem)] gap-1.5 px-1.5 align-middle no-underline",
        className,
      )}
    >
      {iconFailed ? (
        <Globe className="size-3.5 shrink-0 text-muted-foreground" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={favicon}
          alt=""
          width={14}
          height={14}
          className="size-3.5 shrink-0 rounded-[2px]"
          onError={() => setIconFailed(true)}
        />
      )}
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
  );
}
