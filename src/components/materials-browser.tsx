"use client";

import { useRef, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ChevronDown,
  EllipsisVertical,
  FileText,
  Folder,
  FolderInput,
  FolderPlus,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoveToFolderDialog } from "@/components/move-to-folder-dialog";

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
    applicantEditable?: boolean;
  } | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderMentorEditable, setFolderMentorEditable] = useState(false);
  const [folderApplicantEditable, setFolderApplicantEditable] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileEditorKey, setFileEditorKey] = useState(0);
  const [renameName, setRenameName] = useState("");
  const [renameMentorEditable, setRenameMentorEditable] = useState(false);
  const [renameApplicantEditable, setRenameApplicantEditable] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{
    id: string;
    type: "FOLDER" | "FILE";
  } | null>(null);

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
        router.push(`${basePath}/${action.fileId}`);
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
      router.push(`${basePath}/${item.id}`);
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;

  const items = data?.items ?? [];
  const breadcrumbs = data?.breadcrumbs ?? [];
  const folderTitle = breadcrumbs.at(-1)?.name ?? "Workspace";
  const canWriteHere = data?.canWriteHere ?? false;
  const showFolderActions = editMode === "full";
  const canAddFolder = showFolderActions;
  const canAddFile =
    showFolderActions ||
    (editMode === "mentor" && canWriteHere) ||
    (editMode === "none" && canWriteHere);

  return (
    <div className="space-y-6 mt-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{folderTitle}</h1>
        {canAddFile && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="sm" />}>
              Add
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canAddFolder && (
                <DropdownMenuItem
                  onClick={() => {
                    setFolderMentorEditable(false);
                    setFolderApplicantEditable(false);
                    setFolderOpen(true);
                  }}
                >
                  <FolderPlus className="size-4" />
                  Folder
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setFileOpen(true)}>
                <FileText className="size-4" />
                File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border px-4 py-12 text-center text-sm text-muted-foreground">
          This folder is empty.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = item.type === "FOLDER" ? Folder : FileText;
            return (
              <li key={item.id}>
                <div
                  className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border bg-muted/20 p-4 text-left transition-colors hover:bg-muted/40"
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
                  <div className="flex items-start justify-between gap-2">
                    <Icon className="size-4 shrink-0 text-foreground" />
                    {(item.type === "FOLDER" &&
                      (item.mentorEditable || item.applicantEditable)) && (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {item.mentorEditable && (
                          <Badge variant="secondary">Mentor</Badge>
                        )}
                        {item.applicantEditable && (
                          <Badge variant="secondary">Applicant</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <p className="min-w-0 line-clamp-1 font-medium">{item.name}</p>
                    <div
                      className="shrink-0"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            />
                          }
                        >
                          <EllipsisVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {showFolderActions && (
                            <DropdownMenuItem
                              onClick={() => {
                                setRenameTarget({
                                  id: item.id,
                                  name: item.name,
                                  type: item.type,
                                  mentorEditable:
                                    item.type === "FOLDER"
                                      ? item.mentorEditable
                                      : undefined,
                                  applicantEditable:
                                    item.type === "FOLDER"
                                      ? item.applicantEditable
                                      : undefined,
                                });
                                setRenameName(item.name);
                                setRenameMentorEditable(
                                  item.type === "FOLDER"
                                    ? !!item.mentorEditable
                                    : false,
                                );
                                setRenameApplicantEditable(
                                  item.type === "FOLDER"
                                    ? !!item.applicantEditable
                                    : false,
                                );
                              }}
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              setMoveTarget({ id: item.id, type: item.type })
                            }
                          >
                            <FolderInput className="size-4" />
                            Move
                          </DropdownMenuItem>
                          {showFolderActions && (
                            <DropdownMenuItem
                              variant="destructive"
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
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

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
                applicantEditable: folderApplicantEditable,
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
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={folderApplicantEditable}
                onCheckedChange={(checked) =>
                  setFolderApplicantEditable(checked === true)
                }
              />
              Allow accepted applicants to edit contents
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
                  ? {
                      mentorEditable: renameMentorEditable,
                      applicantEditable: renameApplicantEditable,
                    }
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
              <>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={renameMentorEditable}
                    onCheckedChange={(checked) =>
                      setRenameMentorEditable(checked === true)
                    }
                  />
                  Allow mentors to edit contents
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={renameApplicantEditable}
                    onCheckedChange={(checked) =>
                      setRenameApplicantEditable(checked === true)
                    }
                  />
                  Allow accepted applicants to edit contents
                </label>
              </>
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

      <MoveToFolderDialog
        open={!!moveTarget}
        onOpenChange={(open) => {
          if (!open) setMoveTarget(null);
        }}
        itemId={moveTarget?.id ?? null}
        itemType={moveTarget?.type}
        currentParentId={parentId ?? null}
      />
    </div>
  );
}
