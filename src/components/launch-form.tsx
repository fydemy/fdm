"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { contentHasText } from "@/lib/embeds";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z
    .string()
    .refine(contentHasText, "Content is required"),
});

type FormValues = z.infer<typeof schema>;

type LaunchFormProps = {
  initial?: {
    id: string;
    title: string;
    content: string;
    youtubeUrl?: string | null;
    socialEmbeds: string[];
  };
  onDone?: () => void;
};

function mergeLegacyEmbeds(initial?: LaunchFormProps["initial"]): string {
  let content = initial?.content ?? "";
  const legacy = [
    initial?.youtubeUrl,
    ...(initial?.socialEmbeds ?? []),
  ].filter((url): url is string => Boolean(url));

  for (const url of legacy) {
    if (!content.includes(url)) {
      content += `<div data-social-embed="${url}"></div>`;
    }
  }

  return content;
}

export function LaunchForm({ initial, onDone }: LaunchFormProps) {
  const utils = trpc.useUtils();
  const [editorKey, setEditorKey] = useState(0);

  const create = trpc.launch.create.useMutation({
    onSuccess: async () => {
      await utils.launch.listMine.invalidate();
      await utils.application.me.invalidate();
      toast.success("Launch published");
      form.reset({ title: "", content: "" });
      setEditorKey((key) => key + 1);
      onDone?.();
    },
    onError: (error) => toast.error(error.message),
  });

  const update = trpc.launch.update.useMutation({
    onSuccess: async () => {
      await utils.launch.listMine.invalidate();
      await utils.launch.getMine.invalidate();
      await utils.launch.getPublic.invalidate();
      await utils.application.me.invalidate();
      toast.success("Launch updated");
      onDone?.();
    },
    onError: (error) => toast.error(error.message),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      content: mergeLegacyEmbeds(initial),
    },
  });

  async function onSubmit(values: FormValues) {
    const payload = {
      title: values.title,
      content: values.content,
      youtubeUrl: "",
      socialEmbeds: [] as string[],
    };

    if (initial) {
      await update.mutateAsync({ id: initial.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
  }

  const pending = create.isPending || update.isPending;

const formFields = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <RichTextEditor
              key={editorKey}
              value={field.value}
              onChange={field.onChange}
              placeholder="Share what you launched…"
            />
          )}
        />
        {form.formState.errors.content && (
          <p className="text-sm text-destructive">
            {form.formState.errors.content.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {initial ? "Save changes" : "Publish launch"}
      </Button>
    </form>
  );

  if (initial) {
    return formFields;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch details</CardTitle>
      </CardHeader>
      <CardContent>{formFields}</CardContent>
    </Card>
  );
}
