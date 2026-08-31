"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WORKSPACE_ID = "";

type MoveToFolderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  itemType?: "FOLDER" | "FILE";
  currentParentId?: string | null;
  onMoved?: () => void;
};

export function MoveToFolderDialog({
  open,
  onOpenChange,
  itemId,
  itemType,
  currentParentId = null,
  onMoved,
}: MoveToFolderDialogProps) {
  const utils = trpc.useUtils();
  const { data: folders = [], isLoading } = trpc.material.listFolders.useQuery(
    undefined,
    { enabled: open },
  );
  const [destination, setDestination] = useState<string>(
    currentParentId ?? WORKSPACE_ID,
  );

  const blocked = useMemo(() => {
    if (itemType !== "FOLDER" || !itemId) return new Set<string>();
    const children = new Map<string | null, string[]>();
    for (const folder of folders) {
      const parent = folder.parentId;
      const list = children.get(parent) ?? [];
      list.push(folder.id);
      children.set(parent, list);
    }
    const ids = new Set<string>([itemId]);
    const stack = [itemId];
    while (stack.length) {
      const current = stack.pop()!;
      for (const child of children.get(current) ?? []) {
        if (!ids.has(child)) {
          ids.add(child);
          stack.push(child);
        }
      }
    }
    return ids;
  }, [folders, itemId, itemType]);

  const options = useMemo(() => {
    const list = folders
      .filter((folder) => !blocked.has(folder.id))
      .sort((a, b) => a.path.localeCompare(b.path, undefined, { sensitivity: "base" }));
    return [
      { id: WORKSPACE_ID, path: "Workspace" },
      ...list.map((folder) => ({ id: folder.id, path: folder.path })),
    ];
  }, [blocked, folders]);

  const move = trpc.material.move.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.material.list.invalidate(),
        utils.material.get.invalidate(),
        utils.material.listFolders.invalidate(),
      ]);
      toast.success("Moved");
      onMoved?.();
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDestination(currentParentId ?? WORKSPACE_ID);
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
          <DialogDescription>
            Choose a destination for this{" "}
            {itemType === "FOLDER" ? "folder" : "file"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Folder</Label>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center rounded-lg border">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-lg border">
              {options.map((option) => {
                const selected = destination === option.id;
                return (
                  <button
                    key={option.id || "workspace"}
                    type="button"
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-sm hover:bg-muted/60",
                      selected && "bg-muted font-medium",
                    )}
                    onClick={() => setDestination(option.id)}
                  >
                    {option.path}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!itemId || move.isPending}
            onClick={() => {
              if (!itemId) return;
              move.mutate({
                id: itemId,
                parentId: destination === WORKSPACE_ID ? null : destination,
              });
            }}
          >
            {move.isPending && <Loader2 className="size-4 animate-spin" />}
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
