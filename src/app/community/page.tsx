import type { Metadata } from "next";
import { Suspense } from "react";
import CommunityPage from "./community-client";

export const metadata: Metadata = {
  title: "Join the community",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-24 text-center text-sm text-muted-foreground">
          Connecting you to Discord…
        </div>
      }
    >
      <CommunityPage />
    </Suspense>
  );
}
