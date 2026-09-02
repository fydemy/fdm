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
import { findApprovedApplicationForUser } from "@/lib/application-access";

export const userRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const role = getUserRole(ctx.user.role);

    const approvedApplication = canAccessApplicantWorkspace(role)
      ? await findApprovedApplicationForUser({
          id: ctx.user.id,
          email: ctx.user.email,
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
