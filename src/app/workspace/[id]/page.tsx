"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { MaterialFileView } from "@/components/material-file-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function WorkspaceFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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

  return <MaterialFileView id={id} basePath="/workspace" />;
}
