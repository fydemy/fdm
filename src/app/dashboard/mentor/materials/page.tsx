"use client";

import { Suspense } from "react";
import { trpc } from "@/lib/trpc/client";
import { MaterialsBrowser } from "@/components/materials-browser";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function MentorMaterialsContent() {
  const { data: me, isLoading } = trpc.user.me.useQuery();

  if (isLoading) return <Skeleton className="h-96" />;

  if (!me?.isMentor) {
    return (
      <Alert>
        <AlertTitle>Mentor access only</AlertTitle>
        <AlertDescription>
          You do not have permission to manage materials.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <MaterialsBrowser basePath="/dashboard/mentor/materials" editMode="mentor" />
    </div>
  );
}

export default function MentorMaterialsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <MentorMaterialsContent />
    </Suspense>
  );
}
