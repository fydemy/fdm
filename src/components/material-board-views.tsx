"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Columns3, Globe, Lock, Plus, Table2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useBoardEditorUser } from "@/components/board-editor-user";
import { trpc } from "@/lib/trpc/client";
import {
  canEditBoardItem,
  canViewBoardItem,
  createBoardItem,
  itemCreator,
  type BoardItemVisibility,
  type MaterialBoard,
  type MaterialBoardEditor,
  type MaterialBoardItem,
} from "@/lib/material-board";
import { cn } from "@/lib/utils";

type MaterialBoardViewsProps = {
  board: MaterialBoard;
  canEdit: boolean;
  onChange: (board: MaterialBoard) => void;
};

type ItemDialogState =
  | { mode: "create"; status: string }
  | { mode: "edit"; itemId: string };

function stopEditorEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

function BoardCardModal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onMouseDown={stopEditorEvent}
      onPointerDown={stopEditorEvent}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-card-dialog-title"
        className="relative z-10 grid w-full max-w-md gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="board-card-dialog-title"
            className="font-heading text-base leading-none font-medium"
          >
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
        <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
          {footer}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function EditorAvatar({ editor }: { editor: MaterialBoardEditor | null }) {
  if (!editor) return null;
  const initial = editor.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`Created by ${editor.name}`}
    >
      {editor.image ? (
        <span className="size-5 shrink-0 overflow-hidden rounded-full">
          <img
            src={editor.image}
            alt=""
            data-board-avatar
            className="size-5 rounded-full object-cover"
          />
        </span>
      ) : (
        <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[10px] font-medium">
          {initial}
        </span>
      )}
      <span className="max-w-24 truncate text-xs text-muted-foreground">
        {editor.name}
      </span>
    </span>
  );
}

function updateItem(
  board: MaterialBoard,
  id: string,
  patch: Partial<MaterialBoardItem>,
  editor: MaterialBoardEditor | null,
): MaterialBoard {
  return {
    ...board,
    items: board.items.map((item) =>
      item.id === id
        ? {
            ...item,
            ...patch,
            createdBy: item.createdBy,
            editedBy: editor ?? item.editedBy,
          }
        : item,
    ),
  };
}

function VisibilityBadge({ visibility }: { visibility: BoardItemVisibility }) {
  const restricted = visibility === "mentors";
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-muted-foreground"
      title={restricted ? "Mentors" : "Public"}
    >
      {restricted ? <Lock className="size-3" /> : <Globe className="size-3" />}
      {restricted ? "Mentors" : "Public"}
    </span>
  );
}

function KanbanCard({
  item,
  canEdit,
  onOpen,
}: {
  item: MaterialBoardItem;
  canEdit: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      disabled: !canEdit,
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-lg border bg-background p-3 text-left shadow-sm",
        canEdit && "cursor-grab active:cursor-grabbing",
        !canEdit && "cursor-pointer",
        isDragging && "opacity-60",
      )}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (isDragging) return;
        onOpen();
      }}
    >
      <p className="text-sm font-medium">{item.title}</p>
      {item.notes ? (
        <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
          {item.notes}
        </p>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <EditorAvatar editor={itemCreator(item)} />
        <VisibilityBadge visibility={item.visibility} />
      </div>
    </div>
  );
}

function KanbanColumn({
  id,
  name,
  items,
  canEditBoard,
  editor,
  onOpenItem,
  onAdd,
}: {
  id: string;
  name: string;
  items: MaterialBoardItem[];
  canEditBoard: boolean;
  editor: MaterialBoardEditor | null;
  onOpenItem: (itemId: string) => void;
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-64 min-w-56 flex-1 flex-col gap-3 rounded-xl border bg-muted/20 p-3",
        isOver && "border-foreground/30 bg-muted/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{name}</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{items.length}</span>
          {canEditBoard ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Add card to ${name}`}
              onClick={onAdd}
              onPointerDown={stopEditorEvent}
            >
              <Plus className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      {items.map((item) => (
        <KanbanCard
          key={item.id}
          item={item}
          canEdit={canEditBoardItem(item, canEditBoard, editor)}
          onOpen={() => onOpenItem(item.id)}
        />
      ))}
    </div>
  );
}

export function MaterialBoardViews({
  board,
  canEdit,
  onChange,
}: MaterialBoardViewsProps) {
  const editor = useBoardEditorUser();
  const { data: me } = trpc.user.me.useQuery();
  const viewer = me
    ? { id: me.id, isMentor: me.isMentor }
    : editor
      ? { id: editor.id, isMentor: false }
      : null;
  const [view, setView] = useState("kanban");
  const defaultStatus = board.columns[0]?.id ?? "todo";
  const [dialog, setDialog] = useState<ItemDialogState | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(defaultStatus);
  const [visibility, setVisibility] = useState<BoardItemVisibility>("public");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const visibleItems = useMemo(
    () => board.items.filter((item) => canViewBoardItem(item, viewer)),
    [board.items, viewer],
  );

  const itemsByStatus = useMemo(() => {
    const grouped = new Map<string, MaterialBoardItem[]>();
    for (const column of board.columns) grouped.set(column.id, []);
    for (const item of visibleItems) {
      const list = grouped.get(item.status) ?? grouped.get(board.columns[0].id);
      list?.push(item);
    }
    return grouped;
  }, [board.columns, visibleItems]);

  const editingItem =
    dialog?.mode === "edit"
      ? (board.items.find((item) => item.id === dialog.itemId) ?? null)
      : null;
  const itemEditable = editingItem
    ? canEditBoardItem(editingItem, canEdit, editor)
    : canEdit && dialog?.mode === "create";

  function openCreate(columnId: string) {
    setTitle("");
    setNotes("");
    setStatus(columnId);
    setVisibility("public");
    setDialog({ mode: "create", status: columnId });
  }

  function openEdit(itemId: string) {
    const item = board.items.find((entry) => entry.id === itemId);
    if (!item) return;
    setTitle(item.title);
    setNotes(item.notes);
    setStatus(item.status);
    setVisibility(item.visibility);
    setDialog({ mode: "edit", itemId });
  }

  function closeDialog() {
    setDialog(null);
  }

  function saveDialog() {
    if (!dialog) return;
    if (!title.trim()) {
      toast.error("Add a name for the card");
      return;
    }
    if (dialog.mode === "create") {
      onChange({
        ...board,
        items: [
          ...board.items,
          createBoardItem(title, status, notes, editor, visibility),
        ],
      });
      closeDialog();
      return;
    }
    if (!itemEditable) {
      closeDialog();
      return;
    }
    onChange(
      updateItem(
        board,
        dialog.itemId,
        { title, notes, status, visibility },
        editor,
      ),
    );
    closeDialog();
  }

  function deleteEditingItem() {
    if (dialog?.mode !== "edit" || !itemEditable) return;
    onChange({
      ...board,
      items: board.items.filter((row) => row.id !== dialog.itemId),
    });
    closeDialog();
  }

  function onDragEnd(event: DragEndEvent) {
    const overId = event.over?.id;
    if (!overId) return;
    const itemId = String(event.active.id);
    const item = board.items.find((entry) => entry.id === itemId);
    if (!item || !canEditBoardItem(item, canEdit, editor)) return;
    const over = String(overId);
    const column = board.columns.find((entry) => entry.id === over);
    const hoveredItem = board.items.find((entry) => entry.id === over);
    const nextStatus = column?.id ?? hoveredItem?.status;
    if (!nextStatus || nextStatus === item.status) {
      return;
    }
    onChange(updateItem(board, itemId, { status: nextStatus }, editor));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="kanban">
              <Columns3 /> Kanban
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table2 /> Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button
              type="button"
              size="sm"
              onClick={(event) => {
                stopEditorEvent(event);
                openCreate(defaultStatus);
              }}
              onPointerDown={stopEditorEvent}
            >
              <Plus className="size-4" />
              Add card
            </Button>
          ) : null}
        </div>
      </div>

      {view === "kanban" ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                name={column.name}
                items={itemsByStatus.get(column.id) ?? []}
                canEditBoard={canEdit}
                editor={editor}
                onOpenItem={openEdit}
                onAdd={() => openCreate(column.id)}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Created by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No rows yet. {canEdit ? "Add a card to get started." : ""}
                  </TableCell>
                </TableRow>
              )}
              {visibleItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => openEdit(item.id)}
                >
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    {board.columns.find((column) => column.id === item.status)
                      ?.name ?? item.status}
                  </TableCell>
                  <TableCell className="min-w-48">
                    <span className="whitespace-normal text-muted-foreground">
                      {item.notes || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <VisibilityBadge visibility={item.visibility} />
                  </TableCell>
                  <TableCell>
                    <EditorAvatar editor={itemCreator(item)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BoardCardModal
        open={dialog !== null}
        onClose={closeDialog}
        title={dialog?.mode === "create" ? "Add card" : "Card"}
        description={
          dialog?.mode === "create"
            ? "Add a card to this board."
            : itemEditable
              ? "Update the card details, then save."
              : "Only the person who created this card can edit it."
        }
        footer={
          <>
            {itemEditable && dialog?.mode === "edit" ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive sm:mr-auto"
                onClick={deleteEditingItem}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={closeDialog}>
              {itemEditable ? "Cancel" : "Close"}
            </Button>
            {itemEditable ? (
              <Button type="button" onClick={saveDialog}>
                {dialog?.mode === "create" ? "Add card" : "Save"}
              </Button>
            ) : null}
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="board-card-name">Name</Label>
            <Input
              id="board-card-name"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task or page name"
              disabled={!itemEditable}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="board-card-notes">Notes</Label>
            <Textarea
              id="board-card-notes"
              value={notes}
              rows={3}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional"
              disabled={!itemEditable}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="board-card-status">Status</Label>
              <select
                id="board-card-status"
                value={status}
                disabled={!itemEditable}
                onChange={(event) => setStatus(event.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-neutral-50 px-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              >
                {board.columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="board-card-visibility">Visibility</Label>
              <select
                id="board-card-visibility"
                value={visibility}
                disabled={!itemEditable}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "public" || value === "mentors") {
                    setVisibility(value);
                  }
                }}
                className="h-8 w-full rounded-lg border border-input bg-neutral-50 px-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              >
                <option value="public">Public</option>
                <option value="mentors">Mentors</option>
              </select>
            </div>
          </div>
          {editingItem ? (
            <div className="pt-1">
              <EditorAvatar editor={itemCreator(editingItem)} />
            </div>
          ) : null}
        </div>
      </BoardCardModal>
    </div>
  );
}
