"use client";

import Link from "next/link";
import { FileText, Folder, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { MarkdownContent } from "@/components/markdown-content";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type ApplicationWorkspacePanelProps = {
  applicationId: string;
  readOnly?: boolean;
};

export function ApplicationWorkspacePanel({
  applicationId,
  readOnly = true,
}: ApplicationWorkspacePanelProps) {
  const { data: me } = trpc.user.me.useQuery();
  const { data, isLoading, error } = trpc.application.getWorkspace.useQuery({
    applicationId,
  });

  const canOpenWorkspace = Boolean(me?.isReviewer || me?.isMentor);

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  if (error || !data) {
    return null;
  }

  const files = data.items.filter((item) => item.type === "FILE");
  const otherFiles = files.filter((item) => item.id !== data.kanbanLog.id);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Startup workspace</CardTitle>
          <CardDescription>
            {readOnly
              ? "Read-only view of this startup’s dedicated workspace folder."
              : "Dedicated workspace folder for this startup."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Folder className="size-4 shrink-0" />
            <span className="font-medium">{data.folder.name}</span>
            <Badge variant="secondary">Startup folder</Badge>
          </div>

          {otherFiles.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {otherFiles.map((file) => (
                <li key={file.id}>
                  {canOpenWorkspace ? (
                    <Link
                      href={`/workspace/${file.id}`}
                      className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                    >
                      <FileText className="size-4 shrink-0" />
                      <span className="truncate">{file.name}</span>
                      {file.locked ? (
                        <Lock
                          className="ml-auto size-3.5 shrink-0 text-muted-foreground"
                          aria-label="Locked"
                        />
                      ) : null}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                      <FileText className="size-4 shrink-0" />
                      <span className="truncate">{file.name}</span>
                      {file.locked ? (
                        <Lock
                          className="ml-auto size-3.5 shrink-0 text-muted-foreground"
                          aria-label="Locked"
                        />
                      ) : null}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No additional files yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kanban log</CardTitle>
          <CardDescription>
            Synced from this startup’s kanban activity. This log cannot be edited
            or deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarkdownContent
            content={data.kanbanLog.content}
            canEditBoard={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
