"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ArrowRight, Users } from "lucide-react";

const checkoutUrl = "https://checkout.xendit.co/od/fdm-tod";

export function TractionOrDieJoinButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="rounded-full px-10 py-6"
        onClick={() => setOpen(true)}
      >
        Join $20 / Rp 36OK <ArrowRight />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Before you join</DialogTitle>
            <DialogDescription>
              Join our Discord community first. When you sign up, set your
              Discord username to your <strong>last name</strong> so we can
              verify your payment and add you to the program group.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:justify-between">
            <Link
              href={siteConfig.discordInviteUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:w-auto",
              )}
            >
              <Users />
              Join community
            </Link>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              <Button className="w-full sm:w-auto">
                Continue to checkout <ArrowRight />
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
