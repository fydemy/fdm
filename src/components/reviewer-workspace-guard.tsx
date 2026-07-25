"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

function isWorkspacePath(pathname: string) {
  if (pathname.startsWith("/dashboard/review")) return false;
  if (pathname.startsWith("/dashboard/mentor")) return false;
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/apply") ||
    pathname.startsWith("/dashboard/launches") ||
    pathname.startsWith("/dashboard/materials")
  );
}

function staffHomeFor(me: { isReviewer: boolean; isMentor: boolean }) {
  if (me.isReviewer) return "/dashboard/review";
  if (me.isMentor) return "/dashboard/mentor";
  return "/dashboard";
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
      router.replace(staffHomeFor(me));
    }
  }, [shouldRedirect, me, router]);

  if (onWorkspace && (isLoading || me?.isStaff)) {
    return <Skeleton className="h-96" />;
  }

  return children;
}
