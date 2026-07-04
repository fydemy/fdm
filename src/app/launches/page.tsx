"use client";

import { trpc } from "@/lib/trpc/client";
import { PublicSiteHeader } from "@/components/public-site-header";
import { PublicSiteFooter } from "@/components/public-site-footer";
import { LaunchCard } from "@/components/launch-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLaunchesPage() {
  const { data: launches, isLoading } = trpc.launch.listPublic.useQuery();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Launches</h1>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        )}

        {!isLoading && (launches ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No launches published yet.</p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {(launches ?? []).map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
