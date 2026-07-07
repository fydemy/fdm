import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { mentorProcedure } from "../context";
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

export const mentorRouter = t.router({
  listApplications: mentorProcedure.query(async () => {
    return prisma.application.findMany({
      where: { status: "APPROVED" },
      include: {
        members: true,
        user: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { launches: true } },
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
