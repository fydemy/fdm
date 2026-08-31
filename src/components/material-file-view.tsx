"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { encodeBoard } from "@/lib/material-board";
import { MarkdownContent } from "@/components/markdown-content";
import { RichTextEditor } from "@/components/rich-text-editor";
import { BoardEditorUserContext } from "@/components/board-editor-user";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { contentHasText } from "@/lib/embeds";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { EllipsisVertical, FolderInput, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoveToFolderDialog } from "@/components/move-to-folder-dialog";

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
  const [viewContent, setViewContent] = useState("");
  const [moveOpen, setMoveOpen] = useState(false);
  const contentRef = useRef("");

  const { data: session } = authClient.useSession();
  const boardUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image ?? null,
      }
    : null;

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!file) return;
    setName(file.name);
    setContent(file.content ?? "");
    setViewContent(file.content ?? "");
    contentRef.current = file.content ?? "";
    setEditorKey((key) => key + 1);
  }, [file?.id]);

  useEffect(() => {
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, []);

  const persistBoard = trpc.material.updateFile.useMutation({
    onError: (err) => toast.error(err.message),
  });

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

        {!editing && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="ghost" size="icon" />}
            >
              <EllipsisVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => {
                    setName(file.name);
                    setContent(contentRef.current || file.content || "");
                    setEditorKey((key) => key + 1);
                    setEditing(true);
                  }}
                >
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setMoveOpen(true)}>
                <FolderInput className="size-4" />
                Move
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
          className="space-y-4"
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
        <BoardEditorUserContext.Provider value={boardUser}>
          <MarkdownContent
            content={viewContent || file.content || ""}
            canEditBoard={canEdit}
            onBoardChange={(previousPayload, nextBoard) => {
              const html = contentRef.current || file.content || "";
              const encoded = encodeBoard(nextBoard);
              const marker = `data-notion-board="${previousPayload}"`;
              if (!html.includes(marker)) {
                toast.error("Could not update the board");
                return;
              }
              const nextContent = html.replace(marker, `data-notion-board="${encoded}"`);
              contentRef.current = nextContent;
              if (persistTimer.current) clearTimeout(persistTimer.current);
              persistTimer.current = setTimeout(() => {
                persistBoard.mutate({
                  id: file.id,
                  name: file.name,
                  content: nextContent,
                });
              }, 400);
            }}
          />
        </BoardEditorUserContext.Provider>
      )}

      <MoveToFolderDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        itemId={file.id}
        itemType="FILE"
        currentParentId={file.parentId}
      />
    </div>
  );
}
