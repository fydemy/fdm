import { headers } from "next/headers";
import { t } from "./trpc";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { isReviewer } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const createTRPCContext = async (): Promise<TRPCContext> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  return {
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      : null,
  };
};

export type TRPCContext = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  } | null;
};

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const reviewerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isReviewer(ctx.user.email, ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Reviewer access required" });
  }

  return next({ ctx });
});

export const applicantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (isReviewer(ctx.user.email, ctx.user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Workspace access is not available to reviewers",
    });
  }

  return next({ ctx });
});
