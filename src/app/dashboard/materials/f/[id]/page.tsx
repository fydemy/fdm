"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { MaterialFileView } from "@/components/material-file-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MaterialFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = trpc.application.me.useQuery();

  if (isLoading) return <Skeleton className="h-96" />;

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

  return <MaterialFileView id={id} basePath="/dashboard/materials" />;
}
