import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { mentorProcedure } from "../context";
import { prisma } from "@/lib/prisma";
import { APPLICATION_COHORTS } from "@/lib/cohort";

const applicationInclude = {
  members: true,
  user: { select: { id: true, name: true, email: true, image: true } },
};

export const mentorRouter = t.router({
  listApplications: mentorProcedure
    .input(
      z
        .object({
          cohort: z.enum(APPLICATION_COHORTS).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return prisma.application.findMany({
        where: {
          status: "APPROVED",
          ...(input?.cohort ? { cohort: input.cohort } : {}),
        },
        include: {
          members: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getApplication: mentorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const application = await prisma.application.findUnique({
        where: { id: input.id },
        include: applicationInclude,
      });

      if (!application || application.status !== "APPROVED") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Approved application not found",
        });
      }

      return application;
    }),
});
