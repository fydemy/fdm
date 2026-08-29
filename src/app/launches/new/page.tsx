"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { LaunchForm } from "@/components/launch-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewLaunchPage() {
  const router = useRouter();
  const { data, isLoading } = trpc.application.me.useQuery();
  const approved = data?.approved;

  if (isLoading) return <Skeleton className="h-96" />;

  if (!approved) {
    return (
      <Alert>
        <AlertTitle>Approval required</AlertTitle>
        <AlertDescription>
          Launches unlock after a reviewer approves your application.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-3xl space-y-6">
      <LaunchForm onDone={() => router.push("/launches")} />
    </div>
  );
}
