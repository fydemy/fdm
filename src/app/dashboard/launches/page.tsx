"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { LaunchForm } from "@/components/launch-form";
import { ProductLogo } from "@/components/product-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

export default function LaunchesPage() {
  const { data, isLoading } = trpc.application.me.useQuery();
  const approved = data?.approved;
  const { data: launches } = trpc.launch.listMine.useQuery(undefined, {
    enabled: !!approved,
  });
  const utils = trpc.useUtils();
  const remove = trpc.launch.delete.useMutation({
    onSuccess: async () => {
      await utils.launch.listMine.invalidate();
      await utils.application.me.invalidate();
      toast.success("Launch deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: editingLaunch, isLoading: editingLoading } =
    trpc.launch.getMine.useQuery(
      { id: editingId! },
      { enabled: !!editingId },
    );

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Launches</h1>
        </div>
        <Link
          href="/dashboard/launches/new"
          className={cn(buttonVariants())}
        >
          <Plus className="size-4" />
          New launch
        </Link>
      </div>

      <div className="space-y-4">
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
                <div>
                  <CardTitle>{launch.title}</CardTitle>
                  <CardDescription>
                    {new Date(launch.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/launches/${launch.id}`}
                  target="_blank"
                  className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
                >
                  <ExternalLink className="size-4" />
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingId(launch.id)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove.mutate({ id: launch.id })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit launch</DialogTitle>
          </DialogHeader>
          {editingLoading && <Skeleton className="h-64" />}
          {editingLaunch && (
            <LaunchForm
              initial={editingLaunch}
              onDone={() => setEditingId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
