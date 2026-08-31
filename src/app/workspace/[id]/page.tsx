"use client";

import { use } from "react";
import { MaterialFileView } from "@/components/material-file-view";

export default function WorkspaceFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <MaterialFileView id={id} basePath="/workspace" />;
}
