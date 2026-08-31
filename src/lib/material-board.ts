export const DEFAULT_BOARD_COLUMNS = [
  { id: "todo", name: "To do" },
  { id: "doing", name: "In progress" },
  { id: "done", name: "Done" },
] as const;

export type MaterialBoardColumn = {
  id: string;
  name: string;
};

export type MaterialBoardEditor = {
  id: string;
  name: string;
  image: string | null;
};

export type BoardItemVisibility = "public" | "mentors";

export const BOARD_ITEM_TAGS = [
  "ship",
  "experiment",
  "win",
  "blocker",
] as const;

export type BoardItemTag = (typeof BOARD_ITEM_TAGS)[number];

export const BOARD_ITEM_TAG_LABELS: Record<BoardItemTag, string> = {
  ship: "Ship",
  experiment: "Experiment",
  win: "Win",
  blocker: "Blocker",
};

export function parseBoardItemTag(value: unknown): BoardItemTag | "" {
  if (
    typeof value === "string" &&
    (BOARD_ITEM_TAGS as readonly string[]).includes(value)
  ) {
    return value as BoardItemTag;
  }
  return "";
}

export type MaterialBoardItem = {
  id: string;
  title: string;
  status: string;
  notes: string;
  tag: BoardItemTag | "";
  visibility: BoardItemVisibility;
  createdBy: MaterialBoardEditor | null;
  editedBy: MaterialBoardEditor | null;
};

export type MaterialBoard = {
  columns: MaterialBoardColumn[];
  items: MaterialBoardItem[];
};

export function emptyMaterialBoard(): MaterialBoard {
  return {
    columns: DEFAULT_BOARD_COLUMNS.map((column) => ({ ...column })),
    items: [],
  };
}

export function createBoardItem(
  title: string,
  status: string,
  notes = "",
  creator: MaterialBoardEditor | null = null,
  visibility: BoardItemVisibility = "public",
  tag: BoardItemTag,
): MaterialBoardItem {
  return {
    id: crypto.randomUUID(),
    title: title.trim() || "Untitled",
    status,
    notes: notes.trim(),
    tag,
    visibility,
    createdBy: creator,
    editedBy: creator,
  };
}

export function itemCreator(item: MaterialBoardItem): MaterialBoardEditor | null {
  return item.createdBy ?? item.editedBy;
}

export function canEditBoardItem(
  item: MaterialBoardItem,
  canEditBoard: boolean,
  editor: MaterialBoardEditor | null,
): boolean {
  if (!canEditBoard || !editor) return false;
  const creator = itemCreator(item);
  if (!creator) return canEditBoard;
  return creator.id === editor.id;
}

export function canViewBoardItem(
  item: MaterialBoardItem,
  viewer: { id: string; isMentor?: boolean } | null,
): boolean {
  if (item.visibility !== "mentors") return true;
  if (!viewer) return false;
  if (viewer.isMentor) return true;
  return itemCreator(item)?.id === viewer.id;
}

function parseEditor(value: unknown): MaterialBoardEditor | null {
  if (!value || typeof value !== "object") return null;
  const editor = value as MaterialBoardEditor;
  if (!editor.id || !editor.name) return null;
  return {
    id: String(editor.id),
    name: String(editor.name),
    image: editor.image ? String(editor.image) : null,
  };
}

function isBoard(value: unknown): value is MaterialBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as MaterialBoard;
  return Array.isArray(board.columns) && Array.isArray(board.items);
}

export function encodeBoard(board: MaterialBoard) {
  const bytes = new TextEncoder().encode(JSON.stringify(board));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function decodeBoardPayload(encoded: string): MaterialBoard {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!isBoard(parsed)) return emptyMaterialBoard();

    const fallback = emptyMaterialBoard();
    const columns =
      parsed.columns.length > 0
        ? parsed.columns.map((column) => ({
            id: String(column.id),
            name: String(column.name || "Untitled"),
          }))
        : fallback.columns;
    const columnIds = new Set(columns.map((column) => column.id));

    return {
      columns,
        items: parsed.items.map((item) => {
          const editedBy = parseEditor(item.editedBy);
          return {
            id: String(item.id || crypto.randomUUID()),
            title: String(item.title || "Untitled"),
            status: columnIds.has(String(item.status))
              ? String(item.status)
              : columns[0].id,
            notes: String(item.notes || ""),
            tag: parseBoardItemTag(item.tag),
            visibility:
              item.visibility === "mentors" ? "mentors" : "public",
            createdBy: parseEditor(item.createdBy) ?? editedBy,
            editedBy,
          };
        }),
    };
  } catch {
    return emptyMaterialBoard();
  }
}
