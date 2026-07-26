import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { partnerProcedure } from "../context";
import { prisma } from "@/lib/prisma";

const applicationInclude = {
  members: true,
  user: { select: { id: true, name: true, email: true, image: true } },
  launches: {
    select: {
      id: true,
      title: true,
      slug: true,
      featured: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
};

/** Read-only access for partners — can view all applications, cannot modify. */
export const partnerRouter = t.router({
  listApplications: partnerProcedure
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

  getApplication: partnerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: applicationInclude,
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      return application;
    }),
});
