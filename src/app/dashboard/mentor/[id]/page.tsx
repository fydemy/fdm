"use client";

import { use } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";

export default function MentorApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();
  const { data: application, isLoading } = trpc.mentor.getApplication.useQuery(
    { id },
    { enabled: !!me?.isMentor },
  );

  if (meLoading || isLoading) return <Skeleton className="h-96" />;

  if (!me?.isMentor) {
    return (
      <Alert>
        <AlertTitle>Mentor access only</AlertTitle>
        <AlertDescription>
          You do not have permission to view applications.
        </AlertDescription>
      </Alert>
    );
  }

  if (!application) {
    return (
      <Alert>
        <AlertTitle>Not found</AlertTitle>
        <AlertDescription>This approved application does not exist.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard/mentor"
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Founder</CardTitle>
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
                href={`/launches/${launch.slug}`}
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
    </div>
  );
}
