"use client";

import { EMBED_PLATFORM_LABELS, getEmbedInfo } from "@/lib/embeds";
import { cn } from "@/lib/utils";

type SocialEmbedFrameProps = {
  url: string;
  className?: string;
  onRemove?: () => void;
};

export function SocialEmbedFrame({
  url,
  className,
  onRemove,
}: SocialEmbedFrameProps) {
  const info = getEmbedInfo(url);

  if (!info) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        Unsupported embed URL:{" "}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          {url}
        </a>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 text-xs text-destructive underline"
          >
            Remove
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-muted/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
        <span>{EMBED_PLATFORM_LABELS[info.platform]} embed</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-destructive hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      <div
        className={cn(
          info.aspect === "video" ? "aspect-video" : "min-h-[420px]",
        )}
      >
        <iframe
          src={info.src}
          title={`${EMBED_PLATFORM_LABELS[info.platform]} embed`}
          className={cn(
            "h-full w-full",
            info.aspect !== "video" && "min-h-[420px]",
          )}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
