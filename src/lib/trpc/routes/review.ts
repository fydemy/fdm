import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { reviewerProcedure } from "../context";
import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/auth-helpers";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "@/lib/email";

export const reviewRouter = t.router({
  listApplications: reviewerProcedure
    .input(
      z
        .object({
          status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return prisma.application.findMany({
        where: input?.status ? { status: input.status } : undefined,
        include: {
          members: true,
          user: { select: { id: true, name: true, email: true, image: true } },
          _count: { select: { launches: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getApplication: reviewerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: {
          members: true,
          user: { select: { id: true, name: true, email: true, image: true } },
          launches: {
            select: {
              id: true,
              title: true,
              featured: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      return application;
    }),

  decide: reviewerProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["APPROVED", "REJECTED"]),
        note: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: {
          members: true,
          user: { select: { name: true, email: true } },
        },
      });

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      if (application.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Application already reviewed",
        });
      }

      const updated = await prisma.application.update({
        where: { id: input.id },
        data: {
          status: input.status,
          reviewNote: input.note,
          reviewedAt: new Date(),
        },
        include: { members: true, user: true },
      });

      if (input.status === "APPROVED") {
        const applicant = await prisma.user.findUnique({
          where: { id: updated.userId },
          select: { role: true },
        });

        if (applicant && getUserRole(applicant.role) === "applicant") {
          await prisma.user.update({
            where: { id: updated.userId },
            data: { role: "founder" },
          });
        }
      }

      const recipients = [
        ...new Set([
          updated.user.email,
          ...updated.members.map((member) => member.email),
        ]),
      ];

      if (input.status === "APPROVED") {
        await sendApplicationApprovedEmail({
          to: recipients,
          productName: updated.name,
          applicantName: updated.user.name,
          note: input.note,
        });
      } else {
        await sendApplicationRejectedEmail({
          to: recipients,
          productName: updated.name,
          applicantName: updated.user.name,
          note: input.note,
        });
      }

      return updated;
    }),

  listLaunches: reviewerProcedure.query(async () => {
    return prisma.launch.findMany({
      select: {
        id: true,
        title: true,
        featured: true,
        createdAt: true,
        application: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            websiteUrl: true,
            status: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  setLaunchFeatured: reviewerProcedure
    .input(
      z.object({
        id: z.string(),
        featured: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const launch = await prisma.launch.findUnique({
        where: { id: input.id },
        include: { application: { select: { status: true } } },
      });

      if (!launch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Launch not found" });
      }

      if (launch.application.status !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only launches from approved products can be featured",
        });
      }

      return prisma.launch.update({
        where: { id: input.id },
        data: { featured: input.featured },
      });
    }),
});

