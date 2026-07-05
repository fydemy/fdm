"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { MaterialFileView } from "@/components/material-file-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MentorMaterialFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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

  return <MaterialFileView id={id} basePath="/dashboard/mentor/materials" />;
}
