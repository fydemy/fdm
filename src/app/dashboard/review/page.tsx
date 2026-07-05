"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { StatusBadge } from "@/components/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { Check, Eye, X } from "lucide-react";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function ReviewPage() {
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const { data: applications, isLoading } = trpc.review.listApplications.useQuery(
    status === "ALL" ? undefined : { status },
    { enabled: !!me?.isReviewer },
  );
  const utils = trpc.useUtils();

  const [decision, setDecision] = useState<{
    id: string;
    status: "APPROVED" | "REJECTED";
    name: string;
  } | null>(null);
  const [note, setNote] = useState("");

  const decide = trpc.review.decide.useMutation({
    onSuccess: async (_, variables) => {
      await utils.review.listApplications.invalidate();
      toast.success(
        variables.status === "APPROVED"
          ? "Approved — notification email sent"
          : "Rejected — notification email sent",
      );
      setDecision(null);
      setNote("");
    },
    onError: (error) => toast.error(error.message),
  });

  if (meLoading) return <Skeleton className="h-96" />;

  if (!me?.isReviewer) {
    return (
      <Alert>
        <AlertTitle>Reviewer access only</AlertTitle>
        <AlertDescription>
          Your account must have the reviewer role to access this area.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Reviewer dashboard
      </h1>

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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Launches</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(applications ?? []).map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.name}
                    </TableCell>
                    <TableCell>
                      <div>{application.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {application.user.email}
                      </div>
                    </TableCell>
                    <TableCell>{application.members.length}</TableCell>
                    <TableCell>
                      <StatusBadge status={application.status} />
                    </TableCell>
                    <TableCell>{application._count.launches}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Link
                        href={`/dashboard/review/${application.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                      >
                        <Eye className="size-4" />
                        Open
                      </Link>
                      {application.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              setDecision({
                                id: application.id,
                                status: "APPROVED",
                                name: application.name,
                              })
                            }
                          >
                            <Check className="size-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setDecision({
                                id: application.id,
                                status: "REJECTED",
                                name: application.name,
                              })
                            }
                          >
                            <X className="size-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!decision}
        onOpenChange={(open) => {
          if (!open) {
            setDecision(null);
            setNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision?.status === "APPROVED" ? "Approve" : "Reject"}{" "}
              {decision?.name}
            </DialogTitle>
            <DialogDescription>
              This sends the{" "}
              {decision?.status === "APPROVED" ? "approval" : "rejection"} email
              template to the applicant and all members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note">Optional note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Included in the notification email"
            />
          </div>
          <DialogFooter>
            <Button
              variant={
                decision?.status === "APPROVED" ? "default" : "destructive"
              }
              disabled={decide.isPending}
              onClick={() => {
                if (!decision) return;
                decide.mutate({
                  id: decision.id,
                  status: decision.status,
                  note: note || undefined,
                });
              }}
            >
              Confirm {decision?.status === "APPROVED" ? "approval" : "rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
