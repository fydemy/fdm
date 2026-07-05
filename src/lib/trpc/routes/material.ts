import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import {
  applicantProcedure,
  protectedProcedure,
  reviewerProcedure,
} from "../context";
import { prisma } from "@/lib/prisma";
import {
  getUserRole,
  isMentor,
  isReviewer,
} from "@/lib/auth-helpers";
import { contentHasText } from "@/lib/embeds";

async function assertCanReadMaterials(user: { id: string; role: string }) {
  const role = getUserRole(user.role);

  if (role === "reviewer" || role === "mentor") return;

  const application = await prisma.application.findFirst({
    where: { userId: user.id, status: "APPROVED" },
  });

  if (!application) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Approved application required",
    });
  }
}

async function isInMentorEditableTree(folderId: string | null) {
  let currentId = folderId;

  while (currentId) {
    const folder = await prisma.materialItem.findUnique({
      where: { id: currentId },
      select: { parentId: true, mentorEditable: true, type: true },
    });

    if (!folder || folder.type !== "FOLDER") return false;
    if (folder.mentorEditable) return true;
    currentId = folder.parentId;
  }

  return false;
}

async function canWriteInFolder(user: { role: string }, parentId: string | null) {
  if (isReviewer(user.role)) return true;
  if (!isMentor(user.role)) return false;
  if (!parentId) return false;
  return isInMentorEditableTree(parentId);
}

async function canEditFile(user: { role: string }, fileParentId: string | null) {
  if (isReviewer(user.role)) return true;
  if (!isMentor(user.role)) return false;
  return isInMentorEditableTree(fileParentId);
}

async function getBreadcrumbs(folderId: string | null) {
  if (!folderId) return [];

  const crumbs: { id: string; name: string }[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: {
      id: string;
      name: string;
      parentId: string | null;
      type: string;
    } | null = await prisma.materialItem.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, parentId: true, type: true },
    });

    if (!folder || folder.type !== "FOLDER") {
      throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
    }

    crumbs.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }

  return crumbs;
}

function sortItems<
  T extends { type: "FOLDER" | "FILE"; name: string },
>(items: T[]) {
  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === "FOLDER" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export const materialRouter = t.router({
  list: protectedProcedure
    .input(z.object({ parentId: z.string().nullable().optional() }))
    .query(async ({ ctx, input }) => {
      await assertCanReadMaterials(ctx.user);

      const parentId = input.parentId ?? null;
      const breadcrumbs = await getBreadcrumbs(parentId);
      const canWriteHere = await canWriteInFolder(ctx.user, parentId);

      const items = await prisma.materialItem.findMany({
        where: { parentId },
        select: {
          id: true,
          name: true,
          type: true,
          mentorEditable: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        items: sortItems(items),
        breadcrumbs,
        canWriteHere,
      };
    }),

  countFiles: applicantProcedure.query(async ({ ctx }) => {
    const application = await prisma.application.findFirst({
      where: { userId: ctx.user.id, status: "APPROVED" },
    });
    if (!application) return 0;

    return prisma.materialItem.count({ where: { type: "FILE" } });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertCanReadMaterials(ctx.user);

      const item = await prisma.materialItem.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          type: true,
          content: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!item || item.type !== "FILE") {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      const breadcrumbs = await getBreadcrumbs(item.parentId);
      const canEdit = await canEditFile(ctx.user, item.parentId);
      const canDelete = isReviewer(ctx.user.role);

      return { ...item, breadcrumbs, canEdit, canDelete };
    }),

  createFolder: reviewerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        parentId: z.string().nullable().optional(),
        mentorEditable: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parentId = input.parentId ?? null;

      if (parentId) {
        const parent = await prisma.materialItem.findUnique({
          where: { id: parentId },
        });
        if (!parent || parent.type !== "FOLDER") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
        }
      }

      return prisma.materialItem.create({
        data: {
          name: input.name.trim(),
          type: "FOLDER",
          parentId,
          mentorEditable: input.mentorEditable ?? false,
          createdById: ctx.user.id,
        },
      });
    }),

  createFile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        content: z.string().refine(contentHasText, "Content is required"),
        parentId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parentId = input.parentId ?? null;

      if (!(await canWriteInFolder(ctx.user, parentId))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot create files in this folder",
        });
      }

      if (parentId) {
        const parent = await prisma.materialItem.findUnique({
          where: { id: parentId },
        });
        if (!parent || parent.type !== "FOLDER") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
        }
      }

      return prisma.materialItem.create({
        data: {
          name: input.name.trim(),
          type: "FILE",
          content: input.content,
          parentId,
          createdById: ctx.user.id,
        },
      });
    }),

  updateFile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200),
        content: z.string().refine(contentHasText, "Content is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await prisma.materialItem.findUnique({
        where: { id: input.id },
      });

      if (!item || item.type !== "FILE") {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      if (!(await canEditFile(ctx.user, item.parentId))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot edit this file",
        });
      }

      return prisma.materialItem.update({
        where: { id: input.id },
        data: {
          name: input.name.trim(),
          content: input.content,
        },
      });
    }),

  rename: reviewerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200),
        mentorEditable: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const item = await prisma.materialItem.findUnique({
        where: { id: input.id },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return prisma.materialItem.update({
        where: { id: input.id },
        data: {
          name: input.name.trim(),
          ...(item.type === "FOLDER" && input.mentorEditable !== undefined
            ? { mentorEditable: input.mentorEditable }
            : {}),
        },
      });
    }),

  delete: reviewerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const item = await prisma.materialItem.findUnique({
        where: { id: input.id },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      await prisma.materialItem.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
