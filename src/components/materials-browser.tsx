"use client";

import { Fragment, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { contentHasText } from "@/lib/embeds";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText,
  Folder,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MaterialsBrowserProps = {
  basePath: string;
  editMode?: "none" | "full" | "mentor";
};

type AfterCloseAction =
  | { type: "refresh"; message: string }
  | { type: "open-file"; fileId: string; message: string };

export function MaterialsBrowser({
  basePath,
  editMode = "none",
}: MaterialsBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("folder");
  const afterCloseRef = useRef<AfterCloseAction | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.material.list.useQuery({
    parentId: parentId ?? null,
  });

  const [folderOpen, setFolderOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
    type: "FOLDER" | "FILE";
    mentorEditable?: boolean;
  } | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderMentorEditable, setFolderMentorEditable] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileEditorKey, setFileEditorKey] = useState(0);
  const [renameName, setRenameName] = useState("");
  const [renameMentorEditable, setRenameMentorEditable] = useState(false);

  const invalidate = async () => {
    await utils.material.list.invalidate();
    await utils.material.countFiles.invalidate();
  };

  const runAfterClose = (open: boolean) => {
    if (open) return;
    const action = afterCloseRef.current;
    if (!action) return;
    afterCloseRef.current = null;
    // Base UI may invoke this inside flushSync; defer work so React is idle.
    setTimeout(() => {
      toast.success(action.message);
      void invalidate();
      if (action.type === "open-file") {
        router.push(`${basePath}/f/${action.fileId}`);
      }
    }, 0);
  };

  const createFolder = trpc.material.createFolder.useMutation({
    onSuccess: () => {
      afterCloseRef.current = {
        type: "refresh",
        message: "Folder created",
      };
      setFolderName("");
      setFolderOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const createFile = trpc.material.createFile.useMutation({
    onSuccess: (file) => {
      afterCloseRef.current = {
        type: "open-file",
        fileId: file.id,
        message: "File created",
      };
      setFileName("");
      setFileContent("");
      setFileEditorKey((key) => key + 1);
      setFileOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const rename = trpc.material.rename.useMutation({
    onSuccess: () => {
      afterCloseRef.current = { type: "refresh", message: "Renamed" };
      setRenameName("");
      setRenameTarget(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = trpc.material.delete.useMutation({
    onSuccess: () => {
      toast.success("Deleted");
      void invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const folderHref = (id: string | null) =>
    id ? `${basePath}?folder=${id}` : basePath;

  const openItem = (item: { id: string; type: "FOLDER" | "FILE" }) => {
    if (item.type === "FOLDER") {
      router.push(folderHref(item.id));
    } else {
      router.push(`${basePath}/f/${item.id}`);
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;

  const items = data?.items ?? [];
  const breadcrumbs = data?.breadcrumbs ?? [];
  const canWriteHere = data?.canWriteHere ?? false;
  const showFolderActions = editMode === "full";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {breadcrumbs.length !== 0 && (
                <BreadcrumbLink render={<Link href={folderHref(null)} />}>
                  Materials
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={crumb.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={folderHref(crumb.id)} />}>
                      {crumb.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {showFolderActions && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFolderMentorEditable(false);
                setFolderOpen(true);
              }}
            >
              <FolderPlus className="size-4" />
              New folder
            </Button>
            <Button type="button" size="sm" onClick={() => setFileOpen(true)}>
              <Plus className="size-4" />
              New file
            </Button>
          </div>
        )}

        {editMode === "mentor" && canWriteHere && (
          <Button type="button" size="sm" onClick={() => setFileOpen(true)}>
            <Plus className="size-4" />
            New file
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-muted/40 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid-cols-[1fr_140px_auto]">
          <span>Name</span>
          <span className="hidden sm:inline">Modified</span>
          <span className="w-20 text-right">
            {showFolderActions || editMode === "mentor" ? "Actions" : ""}
          </span>
        </div>

        {items.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            This folder is empty.
          </p>
        )}

        <ul className="divide-y">
          {items.map((item) => {
            const Icon = item.type === "FOLDER" ? Folder : FileText;
            return (
              <li
                key={item.id}
                className="group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40 sm:grid-cols-[1fr_140px_auto]"
                onClick={() => openItem(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openItem(item);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={cn(
                      "size-5 shrink-0",
                      item.type === "FOLDER"
                        ? "text-amber-500"
                        : "text-blue-500",
                    )}
                  />
                  <span className="truncate font-medium">{item.name}</span>
                  {item.type === "FOLDER" && item.mentorEditable && (
                    <Badge variant="secondary" className="shrink-0">
                      Mentor
                    </Badge>
                  )}
                </div>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
                <div
                  className="flex w-20 justify-end gap-1"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {showFolderActions && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={() => {
                          setRenameTarget({
                            id: item.id,
                            name: item.name,
                            type: item.type,
                            mentorEditable:
                              item.type === "FOLDER"
                                ? item.mentorEditable
                                : undefined,
                          });
                          setRenameName(item.name);
                          setRenameMentorEditable(
                            item.type === "FOLDER" ? !!item.mentorEditable : false,
                          );
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={() => {
                          const label =
                            item.type === "FOLDER" ? "folder" : "file";
                          if (
                            confirm(
                              `Delete this ${label}?${
                                item.type === "FOLDER"
                                  ? " Everything inside will be deleted too."
                                  : ""
                              }`,
                            )
                          ) {
                            remove.mutate({ id: item.id });
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Dialog
        open={folderOpen}
        onOpenChange={setFolderOpen}
        onOpenChangeComplete={runAfterClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>
              Create a folder in the current location.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createFolder.mutate({
                name: folderName,
                parentId: parentId ?? null,
                mentorEditable: folderMentorEditable,
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="folder-name">Name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                autoFocus
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={folderMentorEditable}
                onCheckedChange={(checked) =>
                  setFolderMentorEditable(checked === true)
                }
              />
              Allow mentors to edit contents
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFolderOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createFolder.isPending}>
                {createFolder.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={fileOpen}
        onOpenChange={setFileOpen}
        onOpenChangeComplete={runAfterClose}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>New file</DialogTitle>
            <DialogDescription>
              {editMode === "mentor"
                ? "Files are shared with approved founders."
                : "Files are shared with every approved applicant."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!contentHasText(fileContent)) {
                toast.error("Content is required");
                return;
              }
              createFile.mutate({
                name: fileName,
                content: fileContent,
                parentId: parentId ?? null,
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="file-name">Name</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="Getting started"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                key={fileEditorKey}
                value={fileContent}
                onChange={setFileContent}
                placeholder="Write material content…"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFileOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createFile.isPending}>
                {createFile.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null);
            setRenameName("");
          }
        }}
        onOpenChangeComplete={runAfterClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!renameTarget) return;
              rename.mutate({
                id: renameTarget.id,
                name: renameName,
                ...(renameTarget.type === "FOLDER"
                  ? { mentorEditable: renameMentorEditable }
                  : {}),
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="rename-name">Name</Label>
              <Input
                id="rename-name"
                value={renameName}
                onChange={(event) => setRenameName(event.target.value)}
                autoFocus
                required
              />
            </div>
            {renameTarget?.type === "FOLDER" && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={renameMentorEditable}
                  onCheckedChange={(checked) =>
                    setRenameMentorEditable(checked === true)
                  }
                />
                Allow mentors to edit contents
              </label>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={rename.isPending}>
                {rename.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
