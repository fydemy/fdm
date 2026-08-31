"use client";

import { Suspense } from "react";
import { trpc } from "@/lib/trpc/client";
import { MaterialsBrowser } from "@/components/materials-browser";
import { Skeleton } from "@/components/ui/skeleton";

function WorkspaceContent() {
  const { data: me, isLoading } = trpc.user.me.useQuery();

  if (isLoading || !me) {
    return <Skeleton className="h-96" />;
  }

  const editMode = me.isReviewer ? "full" : me.isMentor ? "mentor" : "none";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <MaterialsBrowser basePath="/workspace" editMode={editMode} />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <WorkspaceContent />
    </Suspense>
  );
}
