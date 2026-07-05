"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ApplicationForm } from "@/components/application-form";
import { ProductLogo } from "@/components/product-logo";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/seo";
import { ExternalLink } from "lucide-react";

export default function ApplyPage() {
  const { data, isLoading } = trpc.application.me.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [pendingDiscordJoin, setPendingDiscordJoin] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const applications = data?.applications ?? [];
  const canApply = data?.canApply ?? true;
  const isFirstApplication = applications.length === 0;

  if (pendingDiscordJoin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Apply</h1>
        <Card>
          <CardHeader>
            <CardTitle>Application submitted</CardTitle>
            <CardDescription>
              Join the Discord community to continue. This is required after
              your first application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                window.open(
                  siteConfig.discordInviteUrl,
                  "_blank",
                  "noopener,noreferrer",
                );
                setPendingDiscordJoin(false);
              }}
            >
              Join Discord
              <ExternalLink className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFirstApplication || showForm) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Apply</h1>
        <ApplicationForm
          requireDiscordJoin={isFirstApplication}
          onSubmitted={() => setPendingDiscordJoin(true)}
          onSuccess={() => setShowForm(false)}
        />
        {!isFirstApplication && (
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        </div>
        {canApply ? (
          <Button onClick={() => setShowForm(true)}>New application</Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            {data?.latest?.status === "PENDING"
              ? "You already have a pending application."
              : "You can submit another application after your latest one is accepted."}
          </p>
        )}
      </div>

      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ProductLogo
                src={application.logoUrl}
                name={application.name}
                size="md"
              />
              <div>
                <CardTitle>{application.name}</CardTitle>
                <CardDescription>{application.description}</CardDescription>
                {application.websiteUrl && (
                  <a
                    href={application.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-primary underline"
                  >
                    {application.websiteUrl}
                  </a>
                )}
                {application.linkedin && (
                  <a
                    href={application.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-primary underline"
                  >
                    LinkedIn
                  </a>
                )}
                {application.discordUsername && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Discord: {application.discordUsername}
                  </p>
                )}
              </div>
            </div>
            <StatusBadge status={application.status} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Proposal</h3>
              <a
                href={application.proposalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline"
              >
                {application.proposalName}
              </a>
            </div>

            <Separator />

            {application.members.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium">Team members</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {application.members.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-lg border p-3 text-sm"
                    >
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
                </div>
              </div>
            )}

            {application.reviewNote && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 text-sm font-medium">Reviewer note</h3>
                  <p className="text-sm text-muted-foreground">
                    {application.reviewNote}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
