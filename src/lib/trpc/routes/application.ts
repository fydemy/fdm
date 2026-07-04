import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { applicantProcedure } from "../context";
import { prisma } from "@/lib/prisma";
import { sendApplicationReceivedEmail } from "@/lib/email";
import { assertSafeProposalFilename, readProposalMeta } from "@/lib/proposals";
import { assertSafeLogoFilename, readLogoMeta } from "@/lib/logos";

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
        discordUsername: z.string().min(2).max(37),
        proposalUrl: z.string().min(1),
        proposalName: z.string().min(1),
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

      const proposalFilename = input.proposalUrl.startsWith("/api/proposals/")
        ? input.proposalUrl.slice("/api/proposals/".length)
        : null;
      const meta =
        proposalFilename && assertSafeProposalFilename(proposalFilename)
          ? await readProposalMeta(proposalFilename)
          : null;

      if (!meta || meta.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Upload a proposal file before submitting",
        });
      }

      let logoUrl: string | null = null;
      if (input.logoUrl) {
        const logoFilename = input.logoUrl.startsWith("/api/logos/")
          ? input.logoUrl.slice("/api/logos/".length)
          : null;
        const logoMeta =
          logoFilename && assertSafeLogoFilename(logoFilename)
            ? await readLogoMeta(logoFilename)
            : null;

        if (!logoMeta || logoMeta.userId !== ctx.user.id) {
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
          discordUsername: input.discordUsername.trim(),
          proposalUrl: input.proposalUrl,
          proposalName: input.proposalName,
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
});
