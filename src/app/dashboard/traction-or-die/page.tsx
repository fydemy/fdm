"use client";

import { trpc } from "@/lib/trpc/client";
import { TractionOrDieJoinForm } from "@/components/traction-or-die-join-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TractionOrDieDashboardPage() {
  const { data: enrollment, isLoading } = trpc.tractionOrDie.me.useQuery();

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (enrollment) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Traction or Die
          </h1>
          <p className="text-sm text-muted-foreground">
            You&apos;re in the program. We&apos;ll verify your payment and add
            you to the group.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your submission</CardTitle>
            <CardDescription>
              Submitted {new Date(enrollment.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium">Discord username</p>
                <p className="text-muted-foreground">
                  {enrollment.discordUsername}
                </p>
              </div>
              <div>
                <p className="font-medium">Transaction ID</p>
                <p className="text-muted-foreground break-all">
                  {enrollment.transactionId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Traction or Die
        </h1>
        <p className="text-sm text-muted-foreground">
          1-month sprint to force distribution, execution, and measurable
          traction.
        </p>
      </div>

      <TractionOrDieJoinForm />
    </div>
  );
}
