import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { publicProcedure, applicantProcedure } from "../context";
import { prisma } from "@/lib/prisma";

const launchListSelect = {
  id: true,
  title: true,
  featured: true,
  createdAt: true,
  application: {
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      websiteUrl: true,
    },
  },
} as const;

const launchDetailSelect = {
  ...launchListSelect,
  content: true,
  youtubeUrl: true,
  socialEmbeds: true,
} as const;

async function getApprovedApplication(userId: string) {
  const application = await prisma.application.findFirst({
    where: { userId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  if (!application) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only approved applicants can manage launches",
    });
  }

  return application;
}

export const launchRouter = t.router({
  listPublic: publicProcedure.query(async () => {
    return prisma.launch.findMany({
      where: { application: { status: "APPROVED" } },
      select: launchListSelect,
      orderBy: { createdAt: "desc" },
    });
  }),

  listFeatured: publicProcedure.query(async () => {
    return prisma.launch.findMany({
      where: { featured: true, application: { status: "APPROVED" } },
      select: launchListSelect,
      orderBy: { createdAt: "desc" },
    });
  }),

  getPublic: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const launch = await prisma.launch.findFirst({
        where: { id: input.id, application: { status: "APPROVED" } },
        select: launchDetailSelect,
      });

      if (!launch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Launch not found" });
      }

      return launch;
    }),

  listMine: applicantProcedure.query(async ({ ctx }) => {
    return prisma.launch.findMany({
      where: {
        application: { userId: ctx.user.id, status: "APPROVED" },
      },
      select: {
        id: true,
        title: true,
        featured: true,
        createdAt: true,
        application: {
          select: {
            name: true,
            logoUrl: true,
            websiteUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getMine: applicantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const launch = await prisma.launch.findFirst({
        where: {
          id: input.id,
          application: { userId: ctx.user.id, status: "APPROVED" },
        },
        select: {
          id: true,
          title: true,
          content: true,
          youtubeUrl: true,
          socialEmbeds: true,
          featured: true,
          createdAt: true,
        },
      });

      if (!launch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Launch not found" });
      }

      return launch;
    }),

  create: applicantProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        youtubeUrl: z
          .string()
          .optional()
          .refine((value) => !value || URL.canParse(value), "Invalid YouTube URL"),
        socialEmbeds: z.array(z.string().url()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const application = await getApprovedApplication(ctx.user.id);

      return prisma.launch.create({
        data: {
          title: input.title,
          content: input.content,
          youtubeUrl: input.youtubeUrl || null,
          socialEmbeds: input.socialEmbeds,
          applicationId: application.id,
        },
      });
    }),

  update: applicantProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        youtubeUrl: z
          .string()
          .optional()
          .refine((value) => !value || URL.canParse(value), "Invalid YouTube URL"),
        socialEmbeds: z.array(z.string().url()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getApprovedApplication(ctx.user.id);

      const launch = await prisma.launch.findFirst({
        where: {
          id: input.id,
          application: { userId: ctx.user.id, status: "APPROVED" },
        },
      });

      if (!launch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Launch not found" });
      }

      return prisma.launch.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
          youtubeUrl: input.youtubeUrl || null,
          socialEmbeds: input.socialEmbeds,
        },
      });
    }),

  delete: applicantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await getApprovedApplication(ctx.user.id);

      const launch = await prisma.launch.findFirst({
        where: {
          id: input.id,
          application: { userId: ctx.user.id, status: "APPROVED" },
        },
      });

      if (!launch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Launch not found" });
      }

      await prisma.launch.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
