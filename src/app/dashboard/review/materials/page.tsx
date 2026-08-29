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
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <MaterialsBrowser
        basePath="/dashboard/review/materials"
        editMode="full"
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
