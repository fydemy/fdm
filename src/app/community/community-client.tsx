"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { siteConfig } from "@/lib/seo";
import { PublicSiteHeader } from "@/components/public-site-header";

const TOKEN_KEY = "fdm_community_claim";

export default function CommunityPage() {
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const started = useRef(false);

  useEffect(() => {
    const token = searchParams.get("t");
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      document.cookie = `${TOKEN_KEY}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax`;
    }
  }, [searchParams]);

  useEffect(() => {
    if (isPending || started.current) return;
    started.current = true;

    async function run() {
      const token =
        sessionStorage.getItem(TOKEN_KEY) ||
        document.cookie
          .split("; ")
          .find((part) => part.startsWith(`${TOKEN_KEY}=`))
          ?.split("=")
          .slice(1)
          .join("=") ||
        null;

      if (!session) {
        await authClient.signIn.social({
          provider: "discord",
          callbackURL: "/community",
        });
        return;
      }

      const res = await fetch("/api/community/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as {
        needDiscord?: boolean;
        url?: string;
      };

      if (data.needDiscord) {
        await authClient.signIn.social({
          provider: "discord",
          callbackURL: "/community",
        });
        return;
      }

      window.location.href = data.url || siteConfig.discordInviteUrl;
    }

    void run();
  }, [isPending, session]);

  return (
    <div className="min-h-svh">
      <PublicSiteHeader title="Community" hideMarquee />
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
