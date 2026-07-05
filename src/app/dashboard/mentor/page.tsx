"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { ProductLogo } from "@/components/product-logo";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye } from "lucide-react";

export default function MentorApplicationsPage() {
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();
  const { data: applications, isLoading } = trpc.mentor.listApplications.useQuery(
    undefined,
    { enabled: !!me?.isMentor },
  );

  if (meLoading || isLoading) return <Skeleton className="h-96" />;

  if (!me?.isMentor) {
    return (
      <Alert>
        <AlertTitle>Mentor access only</AlertTitle>
        <AlertDescription>
          Your account must have the mentor role to access this area.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Approved applications
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Founders</CardTitle>
        </CardHeader>
        <CardContent>
          {(applications ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No approved applications yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Founder</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Launches</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(applications ?? []).map((application) => (
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
                    <TableCell>{application.members.length}</TableCell>
                    <TableCell>{application._count.launches}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/mentor/${application.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                      >
                        <Eye className="size-4" />
                        Open
                      </Link>
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
