import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import { prisma } from "@/lib/prisma";
import {
  canAccessApplicantWorkspace,
  canAccessWorkspace,
} from "@/lib/auth-helpers";

type SessionPayload = {
  user?: {
    id: string;
  };
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/app", "/workspace"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const { data: sessionData } = await betterFetch<SessionPayload>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  if (!sessionData?.user?.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/workspace")) {
    const user = await prisma.user.findUnique({
      where: { id: sessionData.user.id },
      select: { id: true, role: true },
    });

    if (!user || !canAccessWorkspace(user.role)) {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    if (canAccessApplicantWorkspace(user.role)) {
      const approved = await prisma.application.findFirst({
        where: { userId: user.id, status: "APPROVED" },
        select: { id: true },
      });

      if (!approved) {
        return NextResponse.redirect(new URL("/app", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*", "/workspace", "/workspace/:path*"],
};
