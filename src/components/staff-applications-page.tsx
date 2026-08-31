"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ProductLogo } from "@/components/product-logo";
import { APPLICATION_COHORTS, type ApplicationCohort } from "@/lib/cohort";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
type CohortFilter = "ALL" | ApplicationCohort;

function listFilters(status: StatusFilter, cohort: CohortFilter) {
  return {
    ...(status === "ALL" ? {} : { status }),
    ...(cohort === "ALL" ? {} : { cohort }),
  };
}

export function StaffApplicationsPage() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [cohort, setCohort] = useState<CohortFilter>("ALL");
  const filters = listFilters(status, cohort);

  const reviewerQuery = trpc.review.listApplications.useQuery(filters, {
    enabled: Boolean(me?.isReviewer),
  });
  const mentorQuery = trpc.mentor.listApplications.useQuery(
    cohort === "ALL" ? undefined : { cohort },
    { enabled: Boolean(me?.isMentor) },
  );
  const partnerQuery = trpc.partner.listApplications.useQuery(filters, {
    enabled: Boolean(me?.isPartner),
  });

  const applications = me?.isReviewer
    ? reviewerQuery.data
    : me?.isMentor
      ? mentorQuery.data
      : partnerQuery.data;
  const isLoading = me?.isReviewer
    ? reviewerQuery.isLoading
    : me?.isMentor
      ? mentorQuery.isLoading
      : partnerQuery.isLoading;

  if (meLoading || (me && !me.isStaff)) return <Skeleton className="h-96" />;

  if (!me?.isStaff) {
    return (
      <Alert>
        <AlertTitle>Staff access only</AlertTitle>
        <AlertDescription>
          Applications for your role are available after you sign in with a
          staff account.
        </AlertDescription>
      </Alert>
    );
  }

  const showStatusTabs = me.isReviewer || me.isPartner;

  return (
    <div className="mt-12 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>

      <div className="flex flex-wrap items-center gap-3">
        {showStatusTabs ? (
          <Tabs
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <TabsList>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              <TabsTrigger value="ALL">All</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}
        <Select
          value={cohort}
          onValueChange={(value) => {
            if (value) setCohort(value as CohortFilter);
          }}
        >
          <SelectTrigger className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectItem value="ALL">All cohorts</SelectItem>
            {APPLICATION_COHORTS.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (applications ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications found.
            </p>
          ) : (
            <Table>
              <TableBody>
                {(applications ?? []).map((application) => (
                  <TableRow
                    key={application.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/app/${application.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProductLogo
                          src={application.logoUrl}
                          name={application.name}
                          size="sm"
                        />
                        <span className="font-medium">{application.name}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
