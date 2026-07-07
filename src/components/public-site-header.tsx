import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function PublicSiteHeader({ title }: { title?: string }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-20 max-w-4xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <img src="/logo.svg" alt="Fydemy" className="h-7 w-auto" />
        </Link>
        {title ? (
          <p className="min-w-0 truncate text-sm font-medium">{title}</p>
        ) : (
          <Link
            href="/launches"
            className={cn(buttonVariants({
              variant: "outline",
            }))}
          >
            Browse <ArrowRight />
          </Link>
        )}
      </div>
    </header>
  );
}
