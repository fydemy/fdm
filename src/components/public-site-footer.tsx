import { siteConfig } from "@/lib/seo";

const footerLinks = [
  { label: "Events", href: siteConfig.links.events },
  { label: "GitHub", href: siteConfig.links.github },
  { label: "Instagram", href: siteConfig.links.instagram },
  { label: "TikTok", href: siteConfig.links.tiktok },
  { label: "LinkedIn", href: siteConfig.links.linkedin },
] as const;

export function PublicSiteFooter() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-8">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
