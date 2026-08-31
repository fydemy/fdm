import { t } from "../trpc";
import { protectedProcedure } from "../context";
import {
  canAccessApplicantWorkspace,
  getUserRole,
  isFounder,
  isMentor,
  isPartner,
  isReviewer,
  isStaff,
  roleLabel,
} from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const userRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const role = getUserRole(ctx.user.role);

    const approvedApplication = canAccessApplicantWorkspace(role)
      ? await prisma.application.findFirst({
          where: { userId: ctx.user.id, status: "APPROVED" },
          select: { id: true },
        })
      : null;

    return {
      ...ctx.user,
      role,
      roleLabel: roleLabel(role),
      isReviewer: isReviewer(role),
      isMentor: isMentor(role),
      isPartner: isPartner(role),
      isFounder: isFounder(role),
      isStaff: isStaff(role),
      canAccessApplicantWorkspace: canAccessApplicantWorkspace(role),
      hasApprovedApplication: Boolean(approvedApplication),
    };
  }),
});
