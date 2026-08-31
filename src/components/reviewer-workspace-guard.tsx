"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { staffHomePath } from "@/lib/auth-helpers";

function isApplicantPath(pathname: string) {
  return pathname === "/";
}

export function ReviewerWorkspaceGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me, isLoading } = trpc.user.me.useQuery();
  const onApplicantPath = isApplicantPath(pathname);
  const shouldRedirect = !!me?.isStaff && onApplicantPath;

  useEffect(() => {
    if (shouldRedirect && me) {
      router.replace(staffHomePath(me.role));
    }
  }, [shouldRedirect, me, router]);

  if (onApplicantPath && (isLoading || me?.isStaff)) {
    return <Skeleton className="h-96" />;
  }

  return children;
}
