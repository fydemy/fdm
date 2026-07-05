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
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Materials</h1>
        <p className="text-sm text-muted-foreground">
          You can create and edit files inside folders reviewers mark for mentors.
        </p>
      </div>

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
