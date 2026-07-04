"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { LaunchForm } from "@/components/launch-form";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href="/dashboard/launches"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 w-fit",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to launches
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New launch</h1>
      </div>

      <LaunchForm onDone={() => router.push("/dashboard/launches")} />
    </div>
  );
}
