import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityJoinFlow } from "@/components/community-join-flow";

export const metadata: Metadata = {
  title: "Join",
  robots: { index: false, follow: false },
};

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-24 text-center text-sm text-muted-foreground">
          Connecting you to Discord…
        </div>
      }
    >
      <CommunityJoinFlow callbackPath="/join" headerTitle="Join" />
    </Suspense>
  );
}
