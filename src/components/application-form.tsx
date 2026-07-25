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
import {
  ApplicationScreeningFields,
  defaultScreeningValues,
} from "@/components/application-screening-fields";
import {
  FULL_TIME_STATUSES,
  applicantFormSchema,
  ideaStageHasDeckAlternative,
  isIdeaStage,
  normalizeApplicantForm,
} from "@/lib/screening";
import { siteConfig } from "@/lib/seo";
import { toast } from "sonner";
import { Loader2, MessageCircle, Plus, Trash2, Upload } from "lucide-react";

const schema = z
  .object({
    screening: applicantFormSchema,
    discordUsername: z
      .string()
      .min(2, "Discord username is required")
      .max(37, "Discord username is too long"),
    depositAccepted: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (siteConfig.batchDepositRequired && !data.depositAccepted) {
      ctx.addIssue({
        code: "custom",
        message: "You must agree to the refundable deposit on acceptance",
        path: ["depositAccepted"],
      });
    }

    const options = buildDecisionMakerValues(
      data.screening.founder.founder_name,
      data.screening.founder.team_members,
    );
    if (
      data.screening.founder.primary_decision_maker &&
      !options.includes(data.screening.founder.primary_decision_maker)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select the primary decision-maker from the team list",
        path: ["screening", "founder", "primary_decision_maker"],
      });
    }
  });

type FormValues = z.output<typeof schema>;

function buildDecisionMakerValues(
  founderName: string,
  members: Array<{ name: string; email: string }>,
) {
  const values: string[] = [];
  const founder = founderName.trim();
  if (founder) values.push(`founder:${founder}`);
  for (const member of members) {
    const name = member.name.trim();
    if (name) values.push(`member:${name}:${member.email.trim()}`);
  }
  return values;
}

function buildDecisionMakerOptions(
  founderName: string,
  founderRole: string,
  members: Array<{ name: string; email: string; role?: string }>,
) {
  const options: Array<{ value: string; label: string }> = [];
  const founder = founderName.trim();
  if (founder) {
    const role = founderRole.trim();
    options.push({
      value: `founder:${founder}`,
      label: role ? `${founder} (applicant · ${role})` : `${founder} (applicant)`,
    });
  }
  for (const member of members) {
    const name = member.name.trim();
    if (!name) continue;
    const role = member.role?.trim();
    options.push({
      value: `member:${name}:${member.email.trim()}`,
      label: role
        ? `${name} (${role})`
        : `${name} (${member.email.trim() || "team"})`,
    });
  }
  return options;
}

const emptyTeamMember = {
  name: "",
  role: "",
  email: "",
  linkedin: "",
  full_time_status: "Full-time" as const,
};

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-neutral-50 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

export function ApplicationForm({
  requireDiscordJoin = false,
  onSuccess,
  onSubmitted,
}: {
  requireDiscordJoin?: boolean;
  onSuccess?: () => void;
  onSubmitted?: () => void;
}) {
  const [mustJoinDiscord] = useState(requireDiscordJoin);
  const utils = trpc.useUtils();
  const create = trpc.application.create.useMutation({
    onSuccess: async () => {
      toast.success("Application submitted, check your inbox");

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

  const [pitchDeck, setPitchDeck] = useState<{ url: string; name: string } | null>(
    null,
  );
  const [logo, setLogo] = useState<{ url: string; name: string } | null>(null);
  const [uploadingPitchDeck, setUploadingPitchDeck] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      screening: defaultScreeningValues,
      discordUsername: "",
      depositAccepted: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "screening.founder.team_members",
  });

  const founderName = form.watch("screening.founder.founder_name");
  const founderRole = form.watch("screening.founder.founder_role");
  const founderCount = form.watch("screening.founder.founder_count");
  const teamMembers = form.watch("screening.founder.team_members");
  const productStage = form.watch("screening.company.product_stage");
  const decisionMakerOptions = useMemo(
    () => buildDecisionMakerOptions(founderName, founderRole, teamMembers),
    [founderName, founderRole, teamMembers],
  );
  const requiredTeammates = Math.max(0, Number(founderCount) - 1 || 0);
  const pitchDeckOptional =
    isIdeaStage(productStage) &&
    ideaStageHasDeckAlternative(form.watch("screening.company"));

  useEffect(() => {
    const needed = Math.max(0, Number(founderCount) - 1 || 0);
    const current = fields.length;
    if (needed > current) {
      for (let i = 0; i < needed - current; i += 1) {
        append(emptyTeamMember);
      }
    }
  }, [founderCount, fields.length, append]);

  async function uploadPitchDeck(file: File) {
    setUploadingPitchDeck(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/pitchdeck", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPitchDeck({ url: data.url, name: data.name });
      toast.success("Pitch deck uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingPitchDeck(false);
    }
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setLogo({ url: data.url, name: data.name });
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function onSubmit(values: FormValues) {
    const ideaOptional =
      isIdeaStage(values.screening.company.product_stage) &&
      ideaStageHasDeckAlternative(values.screening.company);

    if (!pitchDeck && !ideaOptional) {
      toast.error(
        isIdeaStage(values.screening.company.product_stage)
          ? "Upload a pitch deck, or provide a mock-up link or written brief"
          : "Upload a pitch deck file first",
      );
      return;
    }

    const members = values.screening.founder.team_members.map((member) => ({
      name: member.name.trim(),
      email: member.email.trim(),
      linkedin: member.linkedin.trim(),
    }));

    await create.mutateAsync({
      screening: normalizeApplicantForm(values.screening),
      discordUsername: values.discordUsername,
      members,
      logoUrl: logo?.url,
      pitchDeckUrl: pitchDeck?.url ?? "",
      pitchDeckName: pitchDeck?.name ?? "",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product application</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <ApplicationScreeningFields
            form={form as never}
            decisionMakerOptions={decisionMakerOptions}
            founderExtras={
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logo">Product logo (optional)</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.png,.jpg,.jpeg,.webp,.gif,.svg"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadLogo(file);
                        }}
                      />
                      {uploadingLogo && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </div>
                    {logo && (
                      <div className="flex items-center gap-3">
                        <img
                          src={logo.url}
                          alt="Product logo preview"
                          className="size-12 rounded-lg object-cover ring-1 ring-border"
                        />
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="size-4" />
                          {logo.name}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setLogo(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="pitchdeck">
                      Pitch deck upload
                      {pitchDeckOptional ? (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          (optional — you shared a mock-up or brief)
                        </span>
                      ) : isIdeaStage(productStage) ? (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          (optional if you provide a mock-up link or written
                          brief)
                        </span>
                      ) : null}
                    </Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <Input
                        id="pitchdeck"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.md"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadPitchDeck(file);
                        }}
                      />
                      {uploadingPitchDeck && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </div>
                    {pitchDeck && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="size-4" />
                        {pitchDeck.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPitchDeck(null)}
                        >
                          Remove
                        </Button>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-medium">
                        Founder / team members (including applicant)
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {requiredTeammates > 0
                          ? `Add ${requiredTeammates} cofounder${requiredTeammates === 1 ? "" : "s"} (role, email, LinkedIn, full-time status).`
                          : "Solo founders can skip this. Add teammates if useful."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append(emptyTeamMember)}
                    >
                      <Plus className="size-4" />
                      Add member
                    </Button>
                  </div>
                  {form.formState.errors.screening?.founder?.team_members
                    ?.message ||
                  form.formState.errors.screening?.founder?.team_members
                    ?.root?.message ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.screening.founder.team_members
                        .message ??
                        form.formState.errors.screening.founder.team_members
                          .root?.message}
                    </p>
                  ) : null}

                  {fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No additional team members added.
                    </p>
                  ) : null}

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-2"
                    >
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          {...form.register(
                            `screening.founder.team_members.${index}.name`,
                          )}
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          {...form.register(
                            `screening.founder.team_members.${index}.role`,
                          )}
                          placeholder="CTO / Co-founder"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          {...form.register(
                            `screening.founder.team_members.${index}.email`,
                          )}
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input
                          {...form.register(
                            `screening.founder.team_members.${index}.linkedin`,
                          )}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Full-time status</Label>
                        <select
                          className={selectClassName}
                          {...form.register(
                            `screening.founder.team_members.${index}.full_time_status`,
                          )}
                        >
                          {FULL_TIME_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={fields.length <= requiredTeammates}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          />

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
                    I agree to the $300 payment if accepted into the program.
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
            disabled={create.isPending || uploadingPitchDeck || uploadingLogo}
          >
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            Submit application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
