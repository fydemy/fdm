"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ProductLogo } from "@/components/product-logo";
import { StatusBadge } from "@/components/status-badge";
import { ApplicationScreeningView } from "@/components/application-screening-view";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getApplicationSummary } from "@/lib/screening";

export default function DashboardApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();

  useEffect(() => {
    if (me && !me.isStaff) router.replace("/app");
  }, [me, router]);

  const reviewerQuery = trpc.review.getApplication.useQuery(
    { id },
    { enabled: Boolean(me?.isReviewer) },
  );
  const mentorQuery = trpc.mentor.getApplication.useQuery(
    { id },
    { enabled: Boolean(me?.isMentor) },
  );
  const partnerQuery = trpc.partner.getApplication.useQuery(
    { id },
    { enabled: Boolean(me?.isPartner) },
  );

  const application = me?.isReviewer
    ? reviewerQuery.data
    : me?.isMentor
      ? mentorQuery.data
      : partnerQuery.data;
  const isLoading = me?.isReviewer
    ? reviewerQuery.isLoading
    : me?.isMentor
      ? mentorQuery.isLoading
      : partnerQuery.isLoading;
  const error = me?.isReviewer
    ? reviewerQuery.error
    : me?.isMentor
      ? mentorQuery.error
      : partnerQuery.error;

  if (meLoading || (me && !me.isStaff) || isLoading) {
    return <Skeleton className="mt-12 h-96" />;
  }

  if (!me?.isStaff) {
    return (
      <Alert>
        <AlertTitle>Staff access only</AlertTitle>
        <AlertDescription>
          You do not have permission to view this application.
        </AlertDescription>
      </Alert>
    );
  }

  if (error || !application) {
    return (
      <Alert>
        <AlertTitle>Not found</AlertTitle>
        <AlertDescription>This application does not exist.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
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
        <p className="text-muted-foreground">
          {getApplicationSummary(application.description)}
        </p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{me.isMentor ? "Founder" : "Applicant"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="font-medium">{application.user.name}</div>
            <div className="text-muted-foreground">{application.user.email}</div>
            {application.linkedin ? (
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
            ) : null}
            {application.discordUsername && (
              <div className="mt-2 text-muted-foreground">
                Discord: {application.discordUsername}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pitch deck</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={application.pitchDeckUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              {application.pitchDeckName}
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationScreeningView description={application.description} />
        </CardContent>
      </Card>

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

      {(application.reviewNote || application.reviewedAt) && (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {application.reviewedAt && (
              <p className="text-muted-foreground">
                Reviewed {new Date(application.reviewedAt).toLocaleString()}
              </p>
            )}
            {application.reviewNote && <p>{application.reviewNote}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
