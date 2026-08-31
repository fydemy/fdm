"use client";

import { trpc } from "@/lib/trpc/client";
import { ApplicantApplicationsPage } from "@/components/applicant-applications-page";
import { StaffApplicationsPage } from "@/components/staff-applications-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppPage() {
  const { data: me, isLoading } = trpc.user.me.useQuery();

  if (isLoading) return <Skeleton className="h-96" />;

  if (me?.isStaff) return <StaffApplicationsPage />;

  return <ApplicantApplicationsPage />;
}
