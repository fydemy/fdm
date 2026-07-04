"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FileText, Package, Rocket } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = trpc.application.me.useQuery();
  const { data: materialCount } = trpc.material.countFiles.useQuery(undefined, {
    enabled: !!data?.approved,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  }

  const latest = data?.latest;
  const approved = data?.approved;
  const launchCount =
    data?.applications
      .filter((application) => application.status === "APPROVED")
      .reduce((total, application) => total + application.launches.length, 0) ??
    0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base tracking-tight">
              <FileText className="size-4" />
              Application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latest ? (
              <>
                <div className="font-medium tracking-tight">{latest.name}</div>
                <StatusBadge status={latest.status} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No application yet</p>
            )}
            <Link
              href="/dashboard/apply"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {latest ? "View applications" : "Apply now"}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base tracking-tight">
              <Rocket className="size-4" />
              Launches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-semibold tracking-tight">
              {launchCount}
            </div>
            <Link
              href="/dashboard/launches"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                !approved && "pointer-events-none opacity-50",
              )}
            >
              Manage launches
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base tracking-tight">
              <Package className="size-4" />
              Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-semibold tracking-tight">
              {materialCount ?? 0}
            </div>
            <Link
              href="/dashboard/materials"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                !approved && "pointer-events-none opacity-50",
              )}
            >
              View materials
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
