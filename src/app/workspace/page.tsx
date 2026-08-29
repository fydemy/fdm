"use client";

import { Suspense } from "react";
import { trpc } from "@/lib/trpc/client";
import { MaterialsBrowser } from "@/components/materials-browser";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function WorkspaceContent() {
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();
  const { data: application, isLoading: appLoading } =
    trpc.application.me.useQuery(undefined, {
      enabled: Boolean(me) && !me?.isStaff,
    });

  if (meLoading || (me && !me.isStaff && appLoading)) {
    return <Skeleton className="h-96" />;
  }

  if (me?.isPartner) {
    return (
      <Alert>
        <AlertTitle>Workspace unavailable</AlertTitle>
        <AlertDescription>
          Workspace is available to applicants, mentors, and reviewers.
        </AlertDescription>
      </Alert>
    );
  }

  const editMode = me?.isReviewer
    ? "full"
    : me?.isMentor
      ? "mentor"
      : "none";

  if (!me?.isStaff && !application?.approved) {
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
    <div className="mx-auto w-full max-w-3xl space-y-8">
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
