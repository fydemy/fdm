"use client";

import { Suspense } from "react";
import { trpc } from "@/lib/trpc/client";
import { MaterialsBrowser } from "@/components/materials-browser";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function MaterialsContent() {
  const { data, isLoading: appLoading } = trpc.application.me.useQuery();

  if (appLoading) return <Skeleton className="h-96" />;

  if (!data?.approved) {
    return (
      <Alert>
        <AlertTitle>Approval required</AlertTitle>
        <AlertDescription>
          Materials from reviewers appear here after your application is approved.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Materials</h1>

      <MaterialsBrowser basePath="/dashboard/materials" />
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <MaterialsContent />
    </Suspense>
  );
}
