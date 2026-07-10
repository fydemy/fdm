import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { applicantProcedure } from "../context";
import { prisma } from "@/lib/prisma";

export const tractionOrDieRouter = t.router({
  me: applicantProcedure.query(async ({ ctx }) => {
    return prisma.tractionOrDieEnrollment.findUnique({
      where: { userId: ctx.user.id },
    });
  }),

  join: applicantProcedure
    .input(
      z.object({
        discordUsername: z
          .string()
          .min(2, "Discord username is required")
          .max(37, "Discord username is too long"),
        transactionId: z
          .string()
          .min(3, "Transaction ID is required")
          .max(120, "Transaction ID is too long"),
        joinedCommunity: z.boolean().refine((value) => value, {
          message: "You must join the Discord community first",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.tractionOrDieEnrollment.findUnique({
        where: { userId: ctx.user.id },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already joined Traction or Die",
        });
      }

      return prisma.tractionOrDieEnrollment.create({
        data: {
          userId: ctx.user.id,
          discordUsername: input.discordUsername,
          transactionId: input.transactionId,
        },
      });
    }),
});
