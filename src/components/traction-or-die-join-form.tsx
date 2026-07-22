"use client";

import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/seo";
import { tractionOrDieVerificationImage } from "@/lib/traction-or-die-images";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";

const schema = z.object({
  discordUsername: z
    .string()
    .min(2, "Discord username is required")
    .max(37, "Discord username is too long"),
  transactionId: z
    .string()
    .min(3, "Transaction ID is required")
    .max(120, "Transaction ID is too long"),
  joinedCommunity: z.boolean().refine((value) => value, {
    message: "You must join the Discord community first",
  }),
});

type FormValues = z.infer<typeof schema>;

export function TractionOrDieJoinForm() {
  const utils = trpc.useUtils();

  const join = trpc.tractionOrDie.join.useMutation({
    onSuccess: async () => {
      toast.success("Joined Traction or Die — we'll verify your payment soon");
      await utils.tractionOrDie.me.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      discordUsername: "",
      transactionId: "",
      joinedCommunity: false,
    },
  });

  async function onSubmit(values: FormValues) {
    await join.mutateAsync({
      discordUsername: values.discordUsername,
      transactionId: values.transactionId,
      joinedCommunity: values.joinedCommunity,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Traction or Die</CardTitle>
        <CardDescription>
          Join for <b>$50 / Rp 900,000</b> (non-refundable) to join the Traction
          or Die program. Minimum pass: ship and get traction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Label>Payable with GoPay, QRIS, DBS Paylah</Label>
          <img
            src={tractionOrDieVerificationImage}
            alt="Verification image"
            className="w-56 aspect-square object-cover"
          />

          <div className="space-y-2">
            <Label htmlFor="discordUsername">Discord username</Label>
            <Input
              id="discordUsername"
              placeholder="yourname"
              {...form.register("discordUsername")}
            />
            {form.formState.errors.discordUsername && (
              <p className="text-sm text-destructive">
                {form.formState.errors.discordUsername.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              placeholder="Paste your payment transaction ID"
              {...form.register("transactionId")}
            />
            {form.formState.errors.transactionId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.transactionId.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Controller
                control={form.control}
                name="joinedCommunity"
                render={({ field }) => (
                  <Checkbox
                    id="joinedCommunity"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={Boolean(form.formState.errors.joinedCommunity)}
                    className="bg-secondary"
                  />
                )}
              />
              <Label htmlFor="joinedCommunity" className="font-normal leading-snug">
                I have joined the Discord community
              </Label>
            </div>
            {form.formState.errors.joinedCommunity && (
              <p className="text-sm text-destructive">
                {form.formState.errors.joinedCommunity.message}
              </p>
            )}
            <Link
              href={siteConfig.discordInviteUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit",
              )}
            >
              Join community
              <ExternalLink className="size-4" />
            </Link>
          </div>

          <Button type="submit" disabled={join.isPending}>
            {join.isPending && <Loader2 className="size-4 animate-spin" />}
            Join the club <ArrowRight />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
