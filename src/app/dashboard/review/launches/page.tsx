"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { ProductLogo } from "@/components/product-logo";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Star } from "lucide-react";

export default function ReviewLaunchesPage() {
  const { data: me, isLoading: meLoading } = trpc.user.me.useQuery();
  const { data: launches, isLoading } = trpc.review.listLaunches.useQuery(
    undefined,
    { enabled: !!me?.isReviewer },
  );
  const utils = trpc.useUtils();
  const setFeatured = trpc.review.setLaunchFeatured.useMutation({
    onSuccess: async (_, variables) => {
      await utils.review.listLaunches.invalidate();
      await utils.launch.listFeatured.invalidate();
      await utils.launch.listPublic.invalidate();
      toast.success(
        variables.featured
          ? "Launch featured on the landing page"
          : "Launch removed from featured",
      );
    },
    onError: (error) => toast.error(error.message),
  });

  if (meLoading || isLoading) return <Skeleton className="h-96" />;

  if (!me?.isReviewer) {
    return (
      <Alert>
        <AlertTitle>Reviewer access only</AlertTitle>
        <AlertDescription>
          You do not have permission to monitor launches.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
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
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>
                    <Link
                      href={`/launches/${launch.id}`}
                      target="_blank"
                      className="hover:underline"
                    >
                      {launch.title}
                    </Link>
                  </CardTitle>
                  {launch.featured && <Badge>Featured</Badge>}
                </div>
                <CardDescription>
                  {launch.application.name} · {launch.application.user.name} ·{" "}
                  {new Date(launch.createdAt).toLocaleString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={launch.featured ? "default" : "outline"}
                size="icon"
                disabled={setFeatured.isPending}
                aria-label={launch.featured ? "Unfeature launch" : "Feature launch"}
                title={launch.featured ? "Unfeature" : "Feature"}
                onClick={() =>
                  setFeatured.mutate({
                    id: launch.id,
                    featured: !launch.featured,
                  })
                }
              >
                <Star className="size-4" />
              </Button>
              <Link
                href={`/dashboard/review/${launch.application.id}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Open product
              </Link>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
