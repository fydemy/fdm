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
  canAccessApplicantWorkspace,
  getUserRole,
  isMentor,
  isReviewer,
} from "@/lib/auth-helpers";
import { findApprovedApplicationForUser } from "@/lib/application-access";
import { contentHasText } from "@/lib/embeds";

async function assertCanReadMaterials(user: {
  id: string;
  email: string;
  role: string;
}) {
  const role = getUserRole(user.role);

  if (role === "reviewer" || role === "mentor") return;

  const application = await findApprovedApplicationForUser({
    id: user.id,
    email: user.email,
  });

  if (!application) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Approved application required",
    });
  }
}

async function isInEditableTree(
  folderId: string | null,
  flag: "mentorEditable" | "applicantEditable",
) {
  let currentId = folderId;

  while (currentId) {
    const folder = await prisma.materialItem.findUnique({
      where: { id: currentId },
      select: {
        parentId: true,
        mentorEditable: true,
        applicantEditable: true,
        type: true,
      },
    });

    if (!folder || folder.type !== "FOLDER") return false;
    if (folder[flag]) return true;
    currentId = folder.parentId;
  }

  return false;
}

async function canWriteInFolder(
  user: { id: string; role: string },
  parentId: string | null,
) {
  if (isReviewer(user.role)) return true;
  if (isMentor(user.role)) {
    if (!parentId) return false;
    return isInEditableTree(parentId, "mentorEditable");
  }
  if (!parentId) return false;
  if (!canAccessApplicantWorkspace(user.role)) return false;
  return isInEditableTree(parentId, "applicantEditable");
}

async function canEditFile(
  user: { id: string; role: string },
  fileParentId: string | null,
) {
  return canWriteInFolder(user, fileParentId);
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

async function isInSubtree(rootId: string, nodeId: string | null) {
  let currentId = nodeId;
  const seen = new Set<string>();

  while (currentId && !seen.has(currentId)) {
    if (currentId === rootId) return true;
    seen.add(currentId);
    const node = await prisma.materialItem.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    if (!node) return false;
    currentId = node.parentId;
  }

  return false;
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
  authorProfiles: protectedProcedure
    .input(z.object({ userIds: z.array(z.string()).max(100) }))
    .query(async ({ ctx, input }) => {
      await assertCanReadMaterials(ctx.user);

      const userIds = [...new Set(input.userIds.filter(Boolean))];
      if (userIds.length === 0) return [];

      const applications = await prisma.application.findMany({
        where: { userId: { in: userIds } },
        select: {
          userId: true,
          name: true,
          status: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      const byUser = new Map<string, { startupName: string; approved: boolean }>();

      for (const application of applications) {
        const current = byUser.get(application.userId);
        const approved = application.status === "APPROVED";
        if (!current || (!current.approved && approved)) {
          byUser.set(application.userId, {
            startupName: application.name,
            approved,
          });
        }
      }

      return userIds.map((userId) => ({
        userId,
        startupName: byUser.get(userId)?.startupName ?? "",
      }));
    }),

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
          applicantEditable: true,
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
    const application = await findApprovedApplicationForUser({
      id: ctx.user.id,
      email: ctx.user.email,
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

  listFolders: protectedProcedure.query(async ({ ctx }) => {
    await assertCanReadMaterials(ctx.user);

    const folders = await prisma.materialItem.findMany({
      where: { type: "FOLDER" },
      select: { id: true, name: true, parentId: true },
    });

    const byId = new Map(folders.map((folder) => [folder.id, folder]));

    return folders.map((folder) => {
      const parts: string[] = [];
      let currentId: string | null = folder.id;
      const seen = new Set<string>();
      while (currentId && !seen.has(currentId)) {
        seen.add(currentId);
        const current = byId.get(currentId);
        if (!current) break;
        parts.unshift(current.name);
        currentId = current.parentId;
      }
      return {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        path: parts.join(" / "),
      };
    });
  }),

  searchFiles: protectedProcedure
    .input(z.object({ query: z.string().max(200).optional() }))
    .query(async ({ ctx, input }) => {
      await assertCanReadMaterials(ctx.user);

      const query = input.query?.trim() ?? "";

      return prisma.materialItem.findMany({
        where: {
          type: "FILE",
          ...(query
            ? {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              }
            : {}),
        },
        select: { id: true, name: true },
        orderBy: { updatedAt: "desc" },
        take: 12,
      });
    }),

  createFolder: reviewerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        parentId: z.string().nullable().optional(),
        mentorEditable: z.boolean().optional(),
        applicantEditable: z.boolean().optional(),
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
          applicantEditable: input.applicantEditable ?? false,
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

  move: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        parentId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await prisma.materialItem.findUnique({
        where: { id: input.id },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const parentId = input.parentId;

      if (parentId) {
        const parent = await prisma.materialItem.findUnique({
          where: { id: parentId },
        });
        if (!parent || parent.type !== "FOLDER") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Folder not found",
          });
        }
      }

      if (item.type === "FOLDER") {
        if (parentId === item.id || (await isInSubtree(item.id, parentId))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot move a folder into itself",
          });
        }
      }

      if (item.parentId === parentId) {
        return item;
      }

      const allowed =
        isReviewer(ctx.user.role) ||
        ((await canWriteInFolder(ctx.user, item.parentId)) &&
          (await canWriteInFolder(ctx.user, parentId)));

      if (!allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot move this item to that folder",
        });
      }

      return prisma.materialItem.update({
        where: { id: item.id },
        data: { parentId },
      });
    }),

  rename: reviewerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200),
        mentorEditable: z.boolean().optional(),
        applicantEditable: z.boolean().optional(),
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
          ...(item.type === "FOLDER" && input.applicantEditable !== undefined
            ? { applicantEditable: input.applicantEditable }
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
