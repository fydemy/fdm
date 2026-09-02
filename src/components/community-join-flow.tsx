"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { siteConfig } from "@/lib/seo";
import { PublicSiteHeader } from "@/components/public-site-header";

export function CommunityJoinFlow({
  callbackPath,
  headerTitle = "Community",
}: {
  callbackPath: string;
  headerTitle?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const started = useRef(false);

  useEffect(() => {
    if (isPending || started.current) return;
    started.current = true;

    async function run() {
      if (!session) {
        await authClient.signIn.social({
          provider: "discord",
          callbackURL: callbackPath,
        });
        return;
      }

      const res = await fetch("/api/community/join", {
        method: "POST",
      });
      const data = (await res.json()) as {
        needDiscord?: boolean;
        url?: string;
      };

      if (data.needDiscord) {
        await authClient.signIn.social({
          provider: "discord",
          callbackURL: callbackPath,
        });
        return;
      }

      window.location.href = data.url || siteConfig.discordInviteUrl;
    }

    void run();
  }, [callbackPath, isPending, session]);

  return (
    <div className="min-h-svh">
      <PublicSiteHeader title={headerTitle} hideMarquee />
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-lg font-medium">Connecting you to Discord…</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with Discord so we can assign the Founder role and open the
          community.
        </p>
      </div>
    </div>
  );
}
