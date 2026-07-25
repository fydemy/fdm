import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowRight, MessageCircle } from "lucide-react";

export function PublicSiteHeader({ title }: { title?: string }) {
  return (
    <div className="border-b bg-background">
      <div className="bg-primary/5">
        <div className="mx-auto max-w-4xl px-6 py-3 text-center text-sm">
          <span className="font-semibold">
            Batch Season {siteConfig.batchSeason.number} is coming
          </span>
          <span className="text-muted-foreground">
            {" "}
            — apply before the {siteConfig.batchSeason.deadlineLabel}
          </span>
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
