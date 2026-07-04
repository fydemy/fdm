"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import { PublicSiteHeader } from "@/components/public-site-header";
import { PublicSiteFooter } from "@/components/public-site-footer";
import { LaunchCard } from "@/components/launch-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function HomePage() {
  const { data: featured, isLoading } = trpc.launch.listFeatured.useQuery();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-16 px-6 py-12">
        <section className="flex flex-col items-center space-y-6 text-center">
          <div className="max-w-lg space-y-3">
            <h1 className="text-4xl font-semibold tracking-tighter">
              Build what they can't live without.
            </h1>
            <p className="text-lg text-muted-foreground">
              Submit your startup
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/dashboard",
                })
              }
              className="rounded-full px-12 py-6"
            >
              Apply <ArrowRight />
            </Button>
            <Link
              href="/launches"
              className={cn(buttonVariants({ variant: "secondary", className: "rounded-full px-12 py-6" }))}
            >
              Browse
            </Link>
          </div>
        </section>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        )}

        {!isLoading && (featured ?? []).length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No featured launches yet. Check back soon, or browse all launches.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {(featured ?? []).map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
