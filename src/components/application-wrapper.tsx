"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ApplicationFormRound1 } from "@/components/application-form-round1";
import { ApplicationFormRound2 } from "@/components/application-form-round2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react";

export function ApplicationWrapper({
  requireDiscordJoin = false,
  onSuccess,
  onSubmitted,
}: {
  requireDiscordJoin?: boolean;
  onSuccess?: () => void;
  onSubmitted?: () => void;
}) {
  const { data, isLoading, refetch } = trpc.application.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  // User has an approved application and can apply again
  if (data.approved && data.canApply) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600" />
            You're approved! Apply again
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Congratulations! Your previous application was approved. You can submit a new application if you're working on something else.
          </p>
          <ApplicationFormRound1
            requireDiscordJoin={requireDiscordJoin}
            onSuccess={() => {
              refetch();
              onSuccess?.();
            }}
            onSubmitted={() => {
              refetch();
              onSubmitted?.();
            }}
            previousApplications={data.previousApplications}
          />
        </CardContent>
      </Card>
    );
  }

  // User is in Round 1 approved stage and can proceed to Round 2
  if (data.round1Approved && data.canApply && data.nextRound === 2) {
    const round1App = data.applications.find(app => app.status === "ROUND1_APPROVED");
    let prefillData = {};
    
    if (round1App) {
      try {
        const parsed = JSON.parse(round1App.description);
        prefillData = {
          linkedin: parsed.linkedin || round1App.linkedin,
          whatBuilding: parsed.whatBuilding || "",
          discordUsername: round1App.discordUsername,
        };
      } catch (e) {
        prefillData = {
          linkedin: round1App.linkedin,
          whatBuilding: "",
          discordUsername: round1App.discordUsername,
        };
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600" />
            Complete Your Application - Round 2
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="size-4" />
            <span className="text-sm font-medium">Round 1 Approved</span>
          </div>
          <p className="text-muted-foreground">
            Your Round 1 application has been approved! Please complete the detailed application below for the final review.
          </p>
          <ApplicationFormRound2
            requireDiscordJoin={requireDiscordJoin}
            onSuccess={() => {
              refetch();
              onSuccess?.();
            }}
            onSubmitted={() => {
              refetch();
              onSubmitted?.();
            }}
            round1ApplicationId={round1App?.id}
            prefillData={prefillData}
          />
        </CardContent>
      </Card>
    );
  }

  // User has a pending application
  if (data.round1Pending || (data.latest && ["ROUND1_PENDING", "ROUND2_PENDING"].includes(data.latest.status))) {
    const pendingApp = data.round1Pending || data.latest!;
    const isRound1 = pendingApp.status === "ROUND1_PENDING";
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-yellow-600" />
            Application Under Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={isRound1 ? "outline" : "secondary"}>
              {isRound1 ? "Round 1" : "Round 2"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Submitted {new Date(pendingApp.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-muted-foreground">
            {isRound1 
              ? "Your Round 1 application is under review. We'll review your LinkedIn profile and product description and email you with a decision soon."
              : "Your complete application is under review. Our team is carefully evaluating your submission and will email you with a decision soon."
            }
          </p>
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
            <AlertCircle className="mt-0.5 size-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p>While you wait, join our Discord community to connect with other founders:</p>
              <a 
                href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#"} 
                target="_blank" 
                rel="noreferrer" 
                className="text-primary underline ml-1"
              >
                Join Discord
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User was rejected and can apply again
  if (data.latest && ["ROUND1_REJECTED", "ROUND2_REJECTED", "REJECTED"].includes(data.latest.status) && data.canApply) {
    const rejectedApp = data.latest;
    const previousAttempts = data.applications.filter(app => 
      ["ROUND1_REJECTED", "ROUND2_REJECTED", "REJECTED"].includes(app.status)
    ).length;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-red-600" />
            Apply Again
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">
              {rejectedApp.status.startsWith("ROUND1_") ? "Round 1 Rejected" : "Rejected"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Previous application from {new Date(rejectedApp.createdAt).toLocaleDateString()}
            </span>
          </div>
          {rejectedApp.reviewNote && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium mb-1">Previous feedback:</p>
              <p className="text-sm text-muted-foreground">{rejectedApp.reviewNote}</p>
            </div>
          )}
          <p className="text-muted-foreground">
            You can submit a new application. We've saved your previous application information for your reference.
          </p>
          <ApplicationFormRound1
            requireDiscordJoin={requireDiscordJoin}
            onSuccess={() => {
              refetch();
              onSuccess?.();
            }}
            onSubmitted={() => {
              refetch();
              onSubmitted?.();
            }}
            previousApplications={data.previousApplications}
          />
        </CardContent>
      </Card>
    );
  }

  // First-time applicant
  return (
    <ApplicationFormRound1
      requireDiscordJoin={requireDiscordJoin}
      onSuccess={() => {
        refetch();
        onSuccess?.();
      }}
      onSubmitted={() => {
        refetch();
        onSubmitted?.();
      }}
      previousApplications={data.previousApplications}
    />
  );
}