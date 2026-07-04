import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function PublicSiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Fydemy" className="h-7 w-auto" />
        </Link>
        <a
          href={siteConfig.discordInviteUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Community
        </a>
      </div>
    </header>
  );
}
