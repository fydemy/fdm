import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowRight, MessageCircle } from "lucide-react";

function BannerMessages({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  return (
    <span aria-hidden={ariaHidden} className="inline-flex">
      <span className="mx-8 inline-flex items-center gap-1">
        <span>
          🚀 Batch S{siteConfig.batchSeason.number} is closed at the
        </span>
        <span className="font-semibold text-foreground">
          {siteConfig.batchSeason.deadlineLabel}
        </span>
        <span>. Apply anytime for the next season!</span>
      </span>
      <span className="mx-8 inline-flex items-center gap-1">
        <span>🤑 Limited time offer: Use code</span>
        <span className="font-semibold text-foreground">FORYOU</span>
        <span>to get 50% off!</span>
      </span>
    </span>
  );
}

export function PublicSiteHeader({ title }: { title?: string }) {
  return (
    <div className="border-b bg-background">
      <div className="overflow-hidden bg-primary/5">
        <div className="flex w-max animate-marquee whitespace-nowrap py-3 text-sm text-muted-foreground">
          <BannerMessages />
          <BannerMessages aria-hidden />
        </div>
      </div>

      <header>
        <div className="mx-auto flex h-20 max-w-4xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex shrink-0 items-center">
            <img src="/logo.svg" alt="Fydemy" className="h-7 w-auto" />
          </Link>
          {title ? (
            <p className="min-w-0 truncate text-sm font-medium">{title}</p>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/launches"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                )}
              >
                Browse <ArrowRight />
              </Link>
              <Link
                href="https://wa.me/6587470061"
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                )}
              >
                <MessageCircle /> Talk
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
