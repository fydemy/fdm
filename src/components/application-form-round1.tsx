"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/seo";
import { toast } from "sonner";
import { Loader2, MessageCircle, Upload } from "lucide-react";

const round1Schema = z.object({
  linkedin: z.string().url("Please enter a valid LinkedIn URL"),
  whatBuilding: z.string().min(10, "Please describe what you're building (at least 10 characters)"),
  discordUsername: z
    .string()
    .min(2, "Discord username is required")
    .max(37, "Discord username is too long"),
  depositAccepted: z.boolean().optional(),
});

type Round1FormValues = z.output<typeof round1Schema>;

interface ApplicationFormRound1Props {
  requireDiscordJoin?: boolean;
  onSuccess?: () => void;
  onSubmitted?: () => void;
  previousApplications?: Array<{ linkedin: string; whatBuilding: string }>;
}

export function ApplicationFormRound1({
  requireDiscordJoin = false,
  onSuccess,
  onSubmitted,
  previousApplications = [],
}: ApplicationFormRound1Props) {
  const [mustJoinDiscord] = useState(requireDiscordJoin);
  const utils = trpc.useUtils();
  
  const create = trpc.application.createRound1.useMutation({
    onSuccess: async () => {
      toast.success("Round 1 application submitted successfully!");
      
      if (mustJoinDiscord) {
        onSubmitted?.();
        await utils.application.me.invalidate();
        return;
      }

      await utils.application.me.invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error(error.message),
  });

  const form = useForm<Round1FormValues>({
    resolver: zodResolver(round1Schema),
    defaultValues: {
      linkedin: previousApplications[0]?.linkedin || "",
      whatBuilding: previousApplications[0]?.whatBuilding || "",
      discordUsername: "",
      depositAccepted: false,
    },
  });

  async function onSubmit(values: Round1FormValues) {
    await create.mutateAsync({
      linkedin: values.linkedin.trim(),
      whatBuilding: values.whatBuilding.trim(),
      discordUsername: values.discordUsername.trim(),
      depositAccepted: values.depositAccepted || false,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application - Round 1</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please provide your LinkedIn profile and a brief description of what you're building.
          If approved, you'll be invited to complete the full application in Round 2.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* LinkedIn Profile */}
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">LinkedIn Profile</h3>
              <p className="text-sm text-muted-foreground">
                Link to your LinkedIn profile or personal website.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  {...form.register("linkedin")}
                  placeholder="https://linkedin.com/in/yourprofile"
                  type="url"
                />
                {form.formState.errors.linkedin && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.linkedin.message}
                  </p>
                )}
                {previousApplications.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Using your previous LinkedIn profile. You can update it if needed.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* What are you building */}
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">What are you building?</h3>
              <p className="text-sm text-muted-foreground">
                Briefly describe the product or service you're working on.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatBuilding">Product/Service Description</Label>
              <textarea
                id="whatBuilding"
                {...form.register("whatBuilding")}
                placeholder="Describe what you're building in a few sentences..."
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
              />
              {form.formState.errors.whatBuilding && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.whatBuilding.message}
                </p>
              )}
              {previousApplications.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Previous application detected. You can update your description or use existing content.
                </p>
              )}
            </div>
          </section>

          {/* Community */}
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Community</h3>
              <p className="text-sm text-muted-foreground">
                Discord username for the batch community.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discordUsername">Discord username</Label>
                <Input
                  id="discordUsername"
                  {...form.register("discordUsername")}
                  placeholder="yourname"
                />
                {form.formState.errors.discordUsername && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.discordUsername.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Terms */}
          <div className="space-y-2">
            {siteConfig.batchDepositRequired && (
              <>
                <div className="flex items-start gap-3">
                  <Controller
                    control={form.control}
                    name="depositAccepted"
                    render={({ field }) => (
                      <Checkbox
                        id="depositAccepted"
                        checked={field.value ?? false}
                        className="bg-secondary"
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        aria-invalid={Boolean(
                          form.formState.errors.depositAccepted,
                        )}
                      />
                    )}
                  />
                  <Label
                    htmlFor="depositAccepted"
                    className="font-normal leading-snug"
                  >
                    I agree to the <span className="line-through">$300</span>{" "}
                    <span className="font-medium">$150</span> payment (50% off)
                    if accepted into the program.
                  </Label>
                </div>
                {form.formState.errors.depositAccepted && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.depositAccepted.message}
                  </p>
                )}
              </>
            )}
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm leading-snug text-muted-foreground">
                Join the Discord community:{" "}
                <a
                  href={siteConfig.discordInviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline"
                >
                  {siteConfig.discordInviteUrl}
                </a>
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={create.isPending}
          >
            {create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Submit Round 1 Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}