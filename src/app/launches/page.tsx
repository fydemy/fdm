"use client";

import { trpc } from "@/lib/trpc/client";
import { authClient } from "@/lib/auth-client";
import { DashboardShell } from "@/components/dashboard-shell";
import { ApplicantLaunches } from "@/components/applicant-launches";
import { ReviewerLaunches } from "@/components/reviewer-launches";
import { PublicSiteHeader } from "@/components/public-site-header";
import { PublicSiteFooter } from "@/components/public-site-footer";
import { LaunchCard } from "@/components/launch-card";
import { Skeleton } from "@/components/ui/skeleton";

function PublicLaunchesBrowse() {
  const { data: launches, isLoading } = trpc.launch.listPublic.useQuery();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader hideMarquee />

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-12">
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

export default function LaunchesPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery(undefined, {
    enabled: Boolean(session?.user),
  });

  if (sessionPending || (session?.user && meLoading)) {
    return <Skeleton className="h-96" />;
  }

  if (me?.isReviewer) {
    return (
      <DashboardShell>
        <ReviewerLaunches />
      </DashboardShell>
    );
  }

  if (session?.user && me && !me.isStaff) {
    return (
      <DashboardShell>
        <ApplicantLaunches />
      </DashboardShell>
    );
  }

  return <PublicLaunchesBrowse />;
}
