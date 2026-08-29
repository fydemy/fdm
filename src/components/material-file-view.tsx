"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { MarkdownContent } from "@/components/markdown-content";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { contentHasText } from "@/lib/embeds";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { EllipsisVertical, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MaterialFileViewProps = {
  id: string;
  basePath: string;
};

export function MaterialFileView({ id, basePath }: MaterialFileViewProps) {
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

  const canEdit = file?.canEdit ?? false;
  const canDelete = file?.canDelete ?? false;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Alert>
          <AlertTitle>File not found</AlertTitle>
          <AlertDescription>
            This file may have been deleted or you do not have access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 mt-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{file.name}</h1>
        </div>

        {canEdit && !editing && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="ghost" size="icon" />}
            >
              <EllipsisVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setName(file.name);
                  setContent(file.content ?? "");
                  setEditorKey((key) => key + 1);
                  setEditing(true);
                }}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Delete this file?")) {
                      remove.mutate({ id: file.id });
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
        <MarkdownContent content={file.content ?? ""} />
      )}
    </div>
  );
}
