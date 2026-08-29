"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { staffHomePath } from "@/lib/auth-helpers";

function isWorkspacePath(pathname: string) {
  if (pathname.startsWith("/dashboard/review")) return false;
  if (pathname.startsWith("/dashboard/mentor")) return false;
  if (pathname.startsWith("/dashboard/partner")) return false;
  return (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/apply") ||
    pathname.startsWith("/launches/new")
  );
}

export function ReviewerWorkspaceGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me, isLoading } = trpc.user.me.useQuery();
  const onWorkspace = isWorkspacePath(pathname);
  const shouldRedirect = !!me?.isStaff && onWorkspace;

  useEffect(() => {
    if (shouldRedirect && me) {
      router.replace(staffHomePath(me.role));
    }
  }, [shouldRedirect, me, router]);

  if (onWorkspace && (isLoading || me?.isStaff)) {
    return <Skeleton className="h-96" />;
  }

  return children;
}
