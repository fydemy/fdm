import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/dashboard", "/workspace", "/apply", "/launches/new"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const { data: sessionData } = await betterFetch("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  if (!sessionData) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspace",
    "/workspace/:path*",
    "/apply",
    "/apply/:path*",
    "/launches/new",
    "/launches/new/:path*",
  ],
};
