"use client";

import { useMemo, useState } from "react";
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
import { Columns3, Download, Plus, Table2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  createBoardItem,
  downloadNotionCsv,
  type MaterialBoard,
  type MaterialBoardEditor,
  type MaterialBoardItem,
} from "@/lib/material-board";
import { cn } from "@/lib/utils";

type MaterialBoardViewsProps = {
  fileName?: string;
  board: MaterialBoard;
  canEdit: boolean;
  onChange: (board: MaterialBoard) => void;
};

function EditorAvatar({ editor }: { editor: MaterialBoardEditor | null }) {
  if (!editor) return null;
  const initial = editor.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`Edited by ${editor.name}`}
    >
      {editor.image ? (
        <img
          src={editor.image}
          alt=""
          className="size-5 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
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
      item.id === id ? { ...item, ...patch, editedBy: editor ?? item.editedBy } : item,
    ),
  };
}

function KanbanCard({
  item,
  canEdit,
}: {
  item: MaterialBoardItem;
  canEdit: boolean;
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
        isDragging && "opacity-60",
      )}
      {...listeners}
      {...attributes}
    >
      <p className="text-sm font-medium">{item.title}</p>
      {item.notes ? (
        <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
          {item.notes}
        </p>
      ) : null}
      {item.editedBy ? (
        <div className="mt-2">
          <EditorAvatar editor={item.editedBy} />
        </div>
      ) : null}
    </div>
  );
}

function KanbanColumn({
  id,
  name,
  items,
  canEdit,
}: {
  id: string;
  name: string;
  items: MaterialBoardItem[];
  canEdit: boolean;
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
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.map((item) => (
        <KanbanCard key={item.id} item={item} canEdit={canEdit} />
      ))}
    </div>
  );
}

export function MaterialBoardViews({
  fileName = "board",
  board,
  canEdit,
  onChange,
}: MaterialBoardViewsProps) {
  const editor = useBoardEditorUser();
  const [view, setView] = useState("kanban");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const defaultStatus = board.columns[0]?.id ?? "todo";
  const [status, setStatus] = useState(defaultStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const itemsByStatus = useMemo(() => {
    const grouped = new Map<string, MaterialBoardItem[]>();
    for (const column of board.columns) grouped.set(column.id, []);
    for (const item of board.items) {
      const list = grouped.get(item.status) ?? grouped.get(board.columns[0].id);
      list?.push(item);
    }
    return grouped;
  }, [board]);

  function addItem() {
    if (!title.trim()) {
      toast.error("Add a name for the row");
      return;
    }
    onChange({
      ...board,
      items: [...board.items, createBoardItem(title, status, notes, editor)],
    });
    setTitle("");
    setNotes("");
  }

  function onDragEnd(event: DragEndEvent) {
    const overId = event.over?.id;
    if (!overId) return;
    const itemId = String(event.active.id);
    const over = String(overId);
    const column = board.columns.find((entry) => entry.id === over);
    const hoveredItem = board.items.find((entry) => entry.id === over);
    const nextStatus = column?.id ?? hoveredItem?.status;
    if (!nextStatus || nextStatus === board.items.find((entry) => entry.id === itemId)?.status) {
      return;
    }
    onChange(updateItem(board, itemId, { status: nextStatus }, editor));
  }

  function exportCsv() {
    if (board.items.length === 0) {
      toast.error("Add at least one row to export");
      return;
    }
    downloadNotionCsv(fileName, board);
    toast.success("CSV downloaded. In Notion: Import → CSV");
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
        <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
          <Download className="size-4" />
          Export
        </Button>
      </div>

      {canEdit && (
        <div className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Name</p>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task or page name"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Notes</p>
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <Select
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(String(value));
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {board.columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={addItem}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      )}

      {view === "kanban" ? (
        <DndContext
          sensors={sensors}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                name={column.name}
                items={itemsByStatus.get(column.id) ?? []}
                canEdit={canEdit}
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
                <TableHead>Edited by</TableHead>
                {canEdit && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {board.items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canEdit ? 5 : 4}
                    className="text-muted-foreground"
                  >
                    No rows yet. {canEdit ? "Add a name above." : ""}
                  </TableCell>
                </TableRow>
              )}
              {board.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {canEdit ? (
                      <Input
                        value={item.title}
                        onChange={(event) =>
                          onChange(
                            updateItem(board, item.id, {
                              title: event.target.value,
                            }, editor),
                          )
                        }
                      />
                    ) : (
                      item.title
                    )}
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
                      <Select
                        value={item.status}
                        onValueChange={(value) => {
                          if (!value) return;
                          onChange(
                            updateItem(board, item.id, { status: String(value) }, editor),
                          );
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {board.columns.map((column) => (
                            <SelectItem key={column.id} value={column.id}>
                              {column.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      board.columns.find((column) => column.id === item.status)
                        ?.name ?? item.status
                    )}
                  </TableCell>
                  <TableCell className="min-w-48">
                    {canEdit ? (
                      <Textarea
                        value={item.notes}
                        rows={2}
                        onChange={(event) =>
                          onChange(
                            updateItem(board, item.id, {
                              notes: event.target.value,
                            }, editor),
                          )
                        }
                      />
                    ) : (
                      <span className="whitespace-normal text-muted-foreground">
                        {item.notes || "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <EditorAvatar editor={item.editedBy} />
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete row"
                        onClick={() =>
                          onChange({
                            ...board,
                            items: board.items.filter(
                              (row) => row.id !== item.id,
                            ),
                          })
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
