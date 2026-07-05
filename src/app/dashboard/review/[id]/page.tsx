"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { ProductLogo } from "@/components/product-logo";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, Check, X } from "lucide-react";

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();
  const { data: application, isLoading } = trpc.review.getApplication.useQuery(
    { id },
    { enabled: !!me?.isReviewer },
  );
  const utils = trpc.useUtils();
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [note, setNote] = useState("");

  const decide = trpc.review.decide.useMutation({
    onSuccess: async () => {
      await utils.review.getApplication.invalidate({ id });
      await utils.review.listApplications.invalidate();
      toast.success("Decision saved and email sent");
      setDecision(null);
      setNote("");
    },
    onError: (error) => toast.error(error.message),
  });

  if (meLoading || isLoading) return <Skeleton className="h-96" />;

  if (!me?.isReviewer) {
    return (
      <Alert>
        <AlertTitle>Reviewer access only</AlertTitle>
        <AlertDescription>
          You do not have permission to review applications.
        </AlertDescription>
      </Alert>
    );
  }

  if (!application) {
    return (
      <Alert>
        <AlertTitle>Not found</AlertTitle>
        <AlertDescription>This application does not exist.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/dashboard/review"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <ProductLogo
              src={application.logoUrl}
              name={application.name}
              size="md"
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              {application.name}
            </h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-muted-foreground">{application.description}</p>
          {application.websiteUrl && (
            <a
              href={application.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-primary underline"
            >
              {application.websiteUrl}
            </a>
          )}
        </div>

        {application.status === "PENDING" && (
          <div className="flex gap-2">
            <Button onClick={() => setDecision("APPROVED")}>
              <Check className="size-4" />
              Approve
            </Button>
            <Button variant="destructive" onClick={() => setDecision("REJECTED")}>
              <X className="size-4" />
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Applicant</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="font-medium">{application.user.name}</div>
            <div className="text-muted-foreground">{application.user.email}</div>
            {application.linkedin && (
              <div className="mt-2">
                <a
                  href={application.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  LinkedIn
                </a>
              </div>
            )}
            {application.discordUsername && (
              <div className="mt-2 text-muted-foreground">
                Discord: {application.discordUsername}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={application.proposalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              {application.proposalName}
            </a>
          </CardContent>
        </Card>
      </div>

      {application.members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team members</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {application.members.map((member) => (
              <div key={member.id} className="rounded-lg border p-3 text-sm">
                <div className="font-medium">{member.name}</div>
                <div className="text-muted-foreground">{member.email}</div>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  LinkedIn
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Launches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {application.launches.length === 0 && (
            <p className="text-sm text-muted-foreground">No launches yet.</p>
          )}
          {application.launches.map((launch) => (
            <div key={launch.id} className="rounded-xl border p-4">
              <Link
                href={`/launches/${launch.id}`}
                target="_blank"
                className="font-medium hover:underline"
              >
                {launch.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {new Date(launch.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
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
              {decision === "APPROVED" ? "Approve" : "Reject"} application
            </DialogTitle>
            <DialogDescription>
              Sends the Resend notification template to the applicant and members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note">Optional note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant={decision === "APPROVED" ? "default" : "destructive"}
              disabled={decide.isPending}
              onClick={() => {
                if (!decision) return;
                decide.mutate({
                  id: application.id,
                  status: decision,
                  note: note || undefined,
                });
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
