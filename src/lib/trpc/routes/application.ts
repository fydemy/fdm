import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { applicantProcedure } from "../context";
import { prisma } from "@/lib/prisma";
import { sendApplicationReceivedEmail } from "@/lib/email";
import {
  readPitchDeckMeta,
  resolvePitchDeckStoragePath,
} from "@/lib/pitchdecks";
import { logoBelongsToUser } from "@/lib/logos";

const memberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  linkedin: z.string().url(),
});

export const applicationRouter = t.router({
  me: applicantProcedure.query(async ({ ctx }) => {
    const applications = await prisma.application.findMany({
      where: { userId: ctx.user.id },
      include: {
        members: true,
        launches: {
          select: { id: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const latest = applications[0] ?? null;
    const approved =
      applications.find((application) => application.status === "APPROVED") ??
      null;

    return {
      applications,
      latest,
      approved,
      canApply: !latest || latest.status === "APPROVED",
    };
  }),

  create: applicantProcedure
    .input(
      z.object({
        name: z.string().min(1).max(120),
        description: z.string().min(1).max(5000),
        logoUrl: z.string().optional(),
        websiteUrl: z
          .string()
          .optional()
          .refine(
            (value) => !value || URL.canParse(value),
            "Enter a valid URL",
          ),
        linkedin: z.string().url(),
        discordUsername: z.string().min(2).max(37),
        pitchDeckUrl: z.string().min(1),
        pitchDeckName: z.string().min(1),
        members: z.array(memberSchema).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const latest = await prisma.application.findFirst({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (latest && latest.status !== "APPROVED") {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            latest.status === "PENDING"
              ? "You already have a pending application"
              : "You can only submit a new application after your latest one is accepted",
        });
      }

      const pitchDeckPath = resolvePitchDeckStoragePath(input.pitchDeckUrl);
      const pitchDeckMeta = pitchDeckPath
        ? readPitchDeckMeta(pitchDeckPath)
        : null;

      if (!pitchDeckMeta || pitchDeckMeta.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Upload a pitch deck file before submitting",
        });
      }

      let logoUrl: string | null = null;
      if (input.logoUrl) {
        if (!logoBelongsToUser(input.logoUrl, ctx.user.id)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Upload a valid logo before submitting",
          });
        }

        logoUrl = input.logoUrl;
      }

      const application = await prisma.application.create({
        data: {
          name: input.name,
          description: input.description,
          logoUrl,
          websiteUrl: input.websiteUrl || null,
          linkedin: input.linkedin.trim(),
          discordUsername: input.discordUsername.trim(),
          pitchDeckUrl: input.pitchDeckUrl,
          pitchDeckName: input.pitchDeckName,
          userId: ctx.user.id,
          members: {
            create: input.members,
          },
        },
        include: { members: true },
      });

      const recipients = [
        ...new Set([
          ctx.user.email,
          ...application.members.map((member) => member.email),
        ]),
      ];

      await sendApplicationReceivedEmail({
        to: recipients,
        productName: application.name,
        applicantName: ctx.user.name,
      });

      return application;
    }),

  submitDeposit: applicantProcedure
    .input(
      z.object({
        applicationId: z.string().min(1),
        transactionId: z.string().min(3).max(120),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const application = await prisma.application.findFirst({
        where: { id: input.applicationId, userId: ctx.user.id },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      if (application.status !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only approved applications can submit a deposit",
        });
      }

      return prisma.application.update({
        where: { id: application.id },
        data: {
          depositTransactionId: input.transactionId.trim(),
          depositSubmittedAt: new Date(),
        },
      });
    }),
});
