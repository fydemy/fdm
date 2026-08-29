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

export type MaterialBoardItem = {
  id: string;
  title: string;
  status: string;
  notes: string;
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
  editedBy: MaterialBoardEditor | null = null,
): MaterialBoardItem {
  return {
    id: crypto.randomUUID(),
    title: title.trim() || "Untitled",
    status,
    notes: notes.trim(),
    editedBy,
  };
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
        items: parsed.items.map((item) => ({
          id: String(item.id || crypto.randomUUID()),
          title: String(item.title || "Untitled"),
          status: columnIds.has(String(item.status))
            ? String(item.status)
            : columns[0].id,
          notes: String(item.notes || ""),
          editedBy: parseEditor(item.editedBy),
        })),
    };
  } catch {
    return emptyMaterialBoard();
  }
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

/** CSV Notion can import as a database (Name + Status + Notes). */
export function boardToNotionCsv(board: MaterialBoard): string {
  const statusById = new Map(
    board.columns.map((column) => [column.id, column.name]),
  );
  const rows = [
    ["Name", "Status", "Notes"].map(csvCell).join(","),
    ...board.items.map((item) =>
      [item.title, statusById.get(item.status) ?? item.status, item.notes]
        .map(csvCell)
        .join(","),
    ),
  ];
  return `\uFEFF${rows.join("\n")}\n`;
}

export function downloadNotionCsv(filename: string, board: MaterialBoard) {
  const blob = new Blob([boardToNotionCsv(board)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename.replace(/[^\w.-]+/g, "-")}-notion.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
