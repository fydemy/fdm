"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { ProductLogo } from "@/components/product-logo";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewerLaunches() {
  const { data: launches, isLoading } = trpc.review.listLaunches.useQuery();

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="mx-auto mt-12 w-full max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Launches</h1>

      {(launches ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">No launches yet.</p>
      )}

      {(launches ?? []).map((launch) => (
        <Card key={launch.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ProductLogo
                src={launch.application.logoUrl}
                name={launch.application.name}
                size="md"
              />
              <div className="space-y-2">
                <CardTitle>
                  <Link
                    href={`/launches/${launch.slug}`}
                    target="_blank"
                    className="hover:underline"
                  >
                    {launch.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {launch.application.name} · {launch.application.user.name} ·{" "}
                  {new Date(launch.createdAt).toLocaleString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
