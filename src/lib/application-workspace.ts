import { prisma } from "@/lib/prisma";
import {
  encodeBoard,
  emptyMaterialBoard,
  parseBoardItemTag,
  type BoardItemVisibility,
  type MaterialBoard,
  type MaterialBoardItem,
} from "@/lib/material-board";

export const KANBAN_LOG_FILE_NAME = "Kanban log";

type ApplicationRef = {
  id: string;
  name: string;
  userId: string;
};

export async function ensureApplicationWorkspace(application: ApplicationRef) {
  let folder = await prisma.materialItem.findFirst({
    where: { applicationId: application.id, type: "FOLDER" },
  });

  if (!folder) {
    folder = await prisma.materialItem.create({
      data: {
        name: application.name.trim() || "Startup",
        type: "FOLDER",
        applicationId: application.id,
        locked: true,
        applicantEditable: true,
        mentorEditable: false,
        parentId: null,
        createdById: application.userId,
      },
    });
  } else if (folder.name !== application.name.trim()) {
    folder = await prisma.materialItem.update({
      where: { id: folder.id },
      data: { name: application.name.trim() || folder.name },
    });
  }

  let logFile = await prisma.materialItem.findFirst({
    where: {
      parentId: folder.id,
      type: "FILE",
      locked: true,
      name: KANBAN_LOG_FILE_NAME,
    },
  });

  if (!logFile) {
    logFile = await prisma.materialItem.create({
      data: {
        name: KANBAN_LOG_FILE_NAME,
        type: "FILE",
        content: buildKanbanLogHtml(emptyMaterialBoard()),
        locked: true,
        parentId: folder.id,
        createdById: application.userId,
      },
    });
  }

  return { folder, logFile };
}

export async function ensureAllApprovedApplicationWorkspaces() {
  const approved = await prisma.application.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true, userId: true },
  });

  for (const application of approved) {
    await ensureApplicationWorkspace(application);
  }
}

export function buildKanbanLogHtml(board: MaterialBoard) {
  const encoded = encodeBoard(board);
  return `<div data-notion-board="${encoded}" data-kanban-log="true"></div>`;
}

export function kanbanLogsToBoard(
  logs: {
    cardId: string;
    title: string;
    notes: string;
    tag: string;
    status: string;
    visibility: string;
    authorUserId: string;
    updatedAt: Date;
  }[],
): MaterialBoard {
  const board = emptyMaterialBoard();
  const columnIds = new Set(board.columns.map((column) => column.id));

  board.items = logs.map((log) => ({
    id: log.cardId,
    title: log.title,
    notes: log.notes,
    tag: parseBoardItemTag(log.tag),
    status: columnIds.has(log.status) ? log.status : board.columns[0].id,
    visibility: log.visibility === "mentors" ? "mentors" : "public",
    createdBy: {
      id: log.authorUserId,
      name: "",
      image: null,
    },
    editedBy: {
      id: log.authorUserId,
      name: "",
      image: null,
    },
  })) satisfies MaterialBoardItem[];

  return board;
}

export async function rebuildKanbanLogFile(applicationId: string) {
  const folder = await prisma.materialItem.findFirst({
    where: { applicationId, type: "FOLDER" },
    select: { id: true },
  });
  if (!folder) return;

  const logFile = await prisma.materialItem.findFirst({
    where: {
      parentId: folder.id,
      type: "FILE",
      locked: true,
      name: KANBAN_LOG_FILE_NAME,
    },
    select: { id: true },
  });
  if (!logFile) return;

  const logs = await prisma.applicationKanbanLog.findMany({
    where: { applicationId },
    orderBy: { updatedAt: "desc" },
  });

  await prisma.materialItem.update({
    where: { id: logFile.id },
    data: { content: buildKanbanLogHtml(kanbanLogsToBoard(logs)) },
  });
}

export async function getApplicationFolder(applicationId: string) {
  return prisma.materialItem.findFirst({
    where: { applicationId, type: "FOLDER" },
    select: {
      id: true,
      name: true,
      locked: true,
      applicationId: true,
    },
  });
}

export async function isStartupFolder(folderId: string | null) {
  if (!folderId) return false;
  const folder = await prisma.materialItem.findUnique({
    where: { id: folderId },
    select: { applicationId: true, type: true },
  });
  return Boolean(folder?.type === "FOLDER" && folder.applicationId);
}

export async function canWriteInStartupFolder(
  user: { id: string; role: string },
  folderId: string,
) {
  const folder = await prisma.materialItem.findUnique({
    where: { id: folderId },
    select: {
      applicationId: true,
      application: { select: { userId: true } },
    },
  });
  if (!folder?.applicationId || !folder.application) return false;
  return folder.application.userId === user.id;
}

export function parseVisibility(value: string): BoardItemVisibility {
  return value === "mentors" ? "mentors" : "public";
}
