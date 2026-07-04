"use client";

import { Suspense } from "react";
import { trpc } from "@/lib/trpc/client";
import { MaterialsBrowser } from "@/components/materials-browser";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ReviewMaterialsContent() {
  const { data: me, isLoading } = trpc.user.me.useQuery();

  if (isLoading) return <Skeleton className="h-96" />;

  if (!me?.isReviewer) {
    return (
      <Alert>
        <AlertTitle>Reviewer access only</AlertTitle>
        <AlertDescription>
          You do not have permission to manage materials.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Materials</h1>

      <MaterialsBrowser
        basePath="/dashboard/review/materials"
        canEdit
      />
    </div>
  );
}

export default function ReviewMaterialsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ReviewMaterialsContent />
    </Suspense>
  );
}
