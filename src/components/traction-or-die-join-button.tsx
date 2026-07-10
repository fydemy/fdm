"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function TractionOrDieJoinButton() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const hasSession = Boolean(session?.user);

  return (
    <Button
      className="rounded-full px-10 py-6"
      onClick={() =>
        hasSession
          ? router.push("/dashboard/traction-or-die")
          : authClient.signIn.social({
              provider: "google",
              callbackURL: "/dashboard/traction-or-die",
            })
      }
    >
      Join $20 / Rp 36OK <ArrowRight />
    </Button>
  );
}
