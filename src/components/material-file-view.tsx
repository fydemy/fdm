"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { MarkdownContent } from "@/components/markdown-content";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { contentHasText } from "@/lib/embeds";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { ArrowLeft, FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MaterialFileViewProps = {
  id: string;
  basePath: string;
  canEdit?: boolean;
};

export function MaterialFileView({
  id,
  basePath,
  canEdit = false,
}: MaterialFileViewProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: file, isLoading, error } = trpc.material.get.useQuery({ id });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setContent(file.content ?? "");
      setEditorKey((key) => key + 1);
    }
  }, [file]);

  const updateFile = trpc.material.updateFile.useMutation({
    onSuccess: async () => {
      await utils.material.get.invalidate({ id });
      await utils.material.list.invalidate();
      toast.success("File saved");
      setEditing(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.material.delete.useMutation({
    onSuccess: async () => {
      await utils.material.list.invalidate();
      await utils.material.countFiles.invalidate();
      toast.success("File deleted");
      const parent = file?.parentId;
      router.push(parent ? `${basePath}?folder=${parent}` : basePath);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  if (error || !file) {
    return (
      <Alert>
        <AlertTitle>File not found</AlertTitle>
        <AlertDescription>
          This file may have been deleted or you do not have access.
        </AlertDescription>
      </Alert>
    );
  }

  const folderHref = (folderId: string | null) =>
    folderId ? `${basePath}?folder=${folderId}` : basePath;

  const parentHref = folderHref(file.parentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <Link
            href={parentHref}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={folderHref(null)} />}>
                  Materials
                </BreadcrumbLink>
              </BreadcrumbItem>
              {file.breadcrumbs.map((crumb) => (
                <Fragment key={crumb.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href={folderHref(crumb.id)} />}>
                      {crumb.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </Fragment>
              ))}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{file.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            <FileText className="size-5 text-blue-500" />
            <h1 className="text-2xl font-semibold tracking-tight">{file.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Updated {new Date(file.updatedAt).toLocaleString()}
          </p>
        </div>

        {canEdit && !editing && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setName(file.name);
                setContent(file.content ?? "");
                setEditorKey((key) => key + 1);
                setEditing(true);
              }}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Delete this file?")) {
                  remove.mutate({ id: file.id });
                }
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <form
          className="space-y-4 rounded-xl border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!contentHasText(content)) {
              toast.error("Content is required");
              return;
            }
            updateFile.mutate({ id: file.id, name, content });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              key={editorKey}
              value={content}
              onChange={setContent}
              placeholder="Write material content…"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={updateFile.isPending}>
              {updateFile.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setName(file.name);
                setContent(file.content ?? "");
                setEditorKey((key) => key + 1);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border p-6">
          <MarkdownContent content={file.content ?? ""} />
        </div>
      )}
    </div>
  );
}
