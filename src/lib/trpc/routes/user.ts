import { t } from "../trpc";
import { protectedProcedure } from "../context";
import { isReviewer } from "@/lib/auth-helpers";

export const userRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      ...ctx.user,
      isReviewer: isReviewer(ctx.user.email, ctx.user.role),
    };
  }),
});
