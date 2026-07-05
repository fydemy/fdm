import { t } from "../trpc";
import { protectedProcedure } from "../context";
import {
  canAccessApplicantWorkspace,
  getUserRole,
  isFounder,
  isMentor,
  isReviewer,
  isStaff,
  roleLabel,
} from "@/lib/auth-helpers";

export const userRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const role = getUserRole(ctx.user.role);

    return {
      ...ctx.user,
      role,
      roleLabel: roleLabel(role),
      isReviewer: isReviewer(role),
      isMentor: isMentor(role),
      isFounder: isFounder(role),
      isStaff: isStaff(role),
      canAccessApplicantWorkspace: canAccessApplicantWorkspace(role),
    };
  }),
});
