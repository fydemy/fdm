"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { PublicSiteHeader } from "@/components/public-site-header";
import { PublicSiteFooter } from "@/components/public-site-footer";
import { ProductLogo } from "@/components/product-logo";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function PublicLaunchPage({ id }: { id: string }) {
  const { data: launch, isLoading, error } = trpc.launch.getPublic.useQuery({
    id,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-6 py-12">
        <Link
          href="/launches"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 w-fit",
          )}
        >
          <ArrowLeft className="size-4" />
          All launches
        </Link>

        {isLoading && <Skeleton className="h-96" />}

        {error && (
          <Alert>
            <AlertTitle>Launch not found</AlertTitle>
            <AlertDescription>
              This launch may have been removed or is not public.
            </AlertDescription>
          </Alert>
        )}

        {launch && (
          <article className="space-y-6">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {launch.featured && <Badge>Featured</Badge>}
                <span className="text-sm text-muted-foreground">
                  {new Date(launch.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-start gap-4">
                <ProductLogo
                  src={launch.application.logoUrl}
                  name={launch.application.name}
                  size="lg"
                />
                <div className="min-w-0 space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {launch.title}
                  </h1>
                  <p className="text-muted-foreground">
                    {launch.application.name}
                  </p>
                  {launch.application.websiteUrl && (
                    <a
                      href={launch.application.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-sm text-primary underline"
                    >
                      {launch.application.websiteUrl}
                    </a>
                  )}
                  {launch.application.description && (
                    <p className="text-sm text-muted-foreground">
                      {launch.application.description}
                    </p>
                  )}
                </div>
              </div>
            </header>

            <MarkdownContent
              content={launch.content}
              youtubeUrl={launch.youtubeUrl}
              socialEmbeds={launch.socialEmbeds}
            />
          </article>
        )}
      </main>

      <PublicSiteFooter />
    </div>
  );
}
