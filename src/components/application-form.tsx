"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/seo";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Add a short description"),
  websiteUrl: z
    .string()
    .refine((value) => !value || URL.canParse(value), "Enter a valid URL"),
  linkedin: z.string().url("Valid LinkedIn URL required"),
  discordUsername: z
    .string()
    .min(2, "Discord username is required")
    .max(37, "Discord username is too long"),
  members: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email required"),
      linkedin: z.string().url("Valid LinkedIn URL required"),
    }),
  ),
  equityAccepted: z.boolean().refine((value) => value, {
    message: `You must agree to allocate ${siteConfig.applicationEquityPercent}% equity on acceptance`,
  }),
});

type FormValues = z.infer<typeof schema>;

export function ApplicationForm({
  requireDiscordJoin = false,
  onSuccess,
  onSubmitted,
}: {
  requireDiscordJoin?: boolean;
  onSuccess?: () => void;
  onSubmitted?: () => void;
}) {
  // Capture at mount so a first-time submit still requires Discord after the
  // applications query refreshes and isFirstApplication becomes false.
  const [mustJoinDiscord] = useState(requireDiscordJoin);
  const utils = trpc.useUtils();
  const create = trpc.application.create.useMutation({
    onSuccess: async () => {
      toast.success("Application submitted — check your inbox");

      if (mustJoinDiscord) {
        // Notify parent before invalidating so the Discord gate stays mounted.
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
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      websiteUrl: "",
      linkedin: "",
      discordUsername: "",
      members: [],
      equityAccepted: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

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
    if (!pitchDeck) {
      toast.error("Upload a pitch deck file first");
      return;
    }

    await create.mutateAsync({
      name: values.name,
      description: values.description,
      websiteUrl: values.websiteUrl,
      linkedin: values.linkedin,
      discordUsername: values.discordUsername,
      members: values.members,
      logoUrl: logo?.url,
      pitchDeckUrl: pitchDeck.url,
      pitchDeckName: pitchDeck.name,
    });
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle>Product application</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" {...form.register("name")} placeholder="Acme" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                {...form.register("description")}
                placeholder="What are you building?"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="websiteUrl">Website URL (optional)</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://example.com"
                {...form.register("websiteUrl")}
              />
              {form.formState.errors.websiteUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.websiteUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                {...form.register("linkedin")}
              />
              {form.formState.errors.linkedin && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.linkedin.message}
                </p>
              )}
            </div>

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
                {uploadingLogo && <Loader2 className="size-4 animate-spin" />}
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
              <Label htmlFor="pitchdeck">Pitch deck upload</Label>
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
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Team members (optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Add LinkedIn and email for each member.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", email: "", linkedin: "" })}
              >
                <Plus className="size-4" />
                Add member
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    {...form.register(`members.${index}.name`)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    {...form.register(`members.${index}.email`)}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input
                    {...form.register(`members.${index}.linkedin`)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Controller
                control={form.control}
                name="equityAccepted"
                render={({ field }) => (
                  <Checkbox
                    id="equityAccepted"
                    checked={field.value}
                    className="bg-secondary"
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={Boolean(form.formState.errors.equityAccepted)}
                  />
                )}
              />
              <Label htmlFor="equityAccepted" className="font-normal leading-snug">
                I agree to allocate <b>{siteConfig.applicationEquityPercent}</b>% equity
                to {siteConfig.name} via SAFE if my team is accepted into the
                batch.
              </Label>
            </div>
            {form.formState.errors.equityAccepted && (
              <p className="text-sm text-destructive">
                {form.formState.errors.equityAccepted.message}
              </p>
            )}
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
