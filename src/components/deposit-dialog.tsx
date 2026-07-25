"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";

const schema = z.object({
  transactionId: z
    .string()
    .min(3, "Transaction ID is required")
    .max(120, "Transaction ID is too long"),
});

type FormValues = z.infer<typeof schema>;

export function DepositDialog({
  applicationId,
  depositSubmitted,
}: {
  applicationId: string;
  depositSubmitted: boolean;
}) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const submit = trpc.application.submitDeposit.useMutation({
    onSuccess: async () => {
      toast.success("Deposit submitted, we'll verify it shortly");
      await utils.application.me.invalidate();
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { transactionId: "" },
  });

  async function onSubmit(values: FormValues) {
    await submit.mutateAsync({
      applicationId,
      transactionId: values.transactionId,
    });
  }

  return (
    <>
      <Button
        variant={depositSubmitted ? "outline" : "default"}
        onClick={() => setOpen(true)}
      >
        {depositSubmitted ? "Update deposit" : "Complete deposit"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your spot</DialogTitle>
            <DialogDescription>
              Pay the $300 deposit via Polar, then paste your payment receipt
              or transaction ID below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <a
              href={siteConfig.depositPaymentUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "w-full",
              )}
            >
              Pay $300 with Polar
              <ExternalLink className="size-4" />
            </a>

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

            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending && <Loader2 className="size-4 animate-spin" />}
              Submit deposit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
