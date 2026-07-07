import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function PublicSiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-20 max-w-4xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Fydemy" className="h-7 w-auto" />
        </Link>
        <Link
          href="/launches"
          className={cn(buttonVariants({
            variant: "outline",
          }))}
        >
          Browse <ArrowRight />
        </Link>
      </div>
    </header>
  );
}
