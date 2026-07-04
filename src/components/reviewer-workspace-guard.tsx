"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

function isWorkspacePath(pathname: string) {
  if (pathname.startsWith("/dashboard/review")) return false;
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/apply") ||
    pathname.startsWith("/dashboard/launches") ||
    pathname.startsWith("/dashboard/materials")
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
  const shouldRedirect = !!me?.isReviewer && onWorkspace;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/dashboard/review");
    }
  }, [shouldRedirect, router]);

  // Resolve role before showing applicant workspace routes to reviewers.
  if (onWorkspace && (isLoading || me?.isReviewer)) {
    return <Skeleton className="h-96" />;
  }

  return children;
}
