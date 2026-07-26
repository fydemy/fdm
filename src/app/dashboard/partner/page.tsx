"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { ProductLogo } from "@/components/product-logo";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { parseScreeningPayload, REVIEW_STATUS_LABELS } from "@/lib/screening";
import { Eye } from "lucide-react";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function PartnerPage() {
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const { data: applications, isLoading } = trpc.partner.listApplications.useQuery(
    status === "ALL" ? undefined : { status },
    { enabled: !!me?.isPartner },
  );

  if (meLoading) return <Skeleton className="h-96" />;

  if (!me?.isPartner) {
    return (
      <Alert>
        <AlertTitle>Partner access only</AlertTitle>
        <AlertDescription>
          Your account must have the partner role to access this area.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Partner dashboard
        </h1>
        <p className="text-muted-foreground">
          Read-only view of all applications
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (applications ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Screening</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Launches</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(applications ?? []).map((application) => {
                  const evaluation = parseScreeningPayload(
                    application.description,
                  )?.evaluation;
                  return (
                    <TableRow key={application.id}>
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
                      <TableCell>
                        <div>{application.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {application.user.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {evaluation
                          ? REVIEW_STATUS_LABELS[
                              evaluation.decision.review_status
                            ]
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={application.status} />
                      </TableCell>
                      <TableCell>{application._count.launches}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/dashboard/partner/${application.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                          )}
                        >
                          <Eye className="size-4" />
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
