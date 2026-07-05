"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { marked } from "marked";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Share2,
  Underline as UnderlineIcon,
} from "lucide-react";
import { SocialEmbed } from "@/components/social-embed-extension";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEmbedInfo, isHtmlContent } from "@/lib/embeds";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function toEditorHtml(content: string): string {
  if (!content) return "";
  if (isHtmlContent(content)) return content;
  return marked.parse(content, { async: false }) as string;
}

async function uploadEditorImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload/image", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.url as string;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your launch post…",
  className,
}: RichTextEditorProps) {
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageRef = useRef<(file: File) => void>(() => {});

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
        },
      }),
      Placeholder.configure({ placeholder }),
      SocialEmbed,
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[240px] px-4 py-3 focus:outline-none",
      },
      handlePaste(_view, event) {
        const file = Array.from(event.clipboardData?.files ?? []).find(isImageFile);
        if (!file) return false;
        event.preventDefault();
        uploadImageRef.current(file);
        return true;
      },
      handleDrop(_view, event, _slice, moved) {
        if (moved) return false;
        const file = Array.from(event.dataTransfer?.files ?? []).find(isImageFile);
        if (!file) return false;
        event.preventDefault();
        uploadImageRef.current(file);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  async function insertImage(file: File) {
    if (!editor || uploadingImage) return;

    setUploadingImage(true);
    try {
      const url = await uploadEditorImage(file);
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: file.name })
        .run();
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  useEffect(() => {
    uploadImageRef.current = (file) => {
      void insertImage(file);
    };
  });

  function insertEmbed() {
    if (!editor) return;
    const trimmed = embedUrl.trim();
    const info = getEmbedInfo(trimmed);
    if (!info) {
      toast.error(
        "Paste a YouTube, X, LinkedIn, or Instagram post URL",
      );
      return;
    }

    editor
      .chain()
      .focus()
      .setSocialEmbed({ url: trimmed })
      .createParagraphNear()
      .run();
    setEmbedUrl("");
    setEmbedOpen(false);
  }

  function applyLink() {
    if (!editor) return;
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkOpen(false);
      return;
    }

    try {
      const href = new URL(trimmed).toString();
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href })
        .run();
      setLinkUrl("");
      setLinkOpen(false);
    } catch {
      toast.error("Enter a valid URL");
    }
  }

  function openLinkDialog() {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  }

  if (!editor) {
    return (
      <div
        className={cn("min-h-[300px] rounded-xl bg-muted/30", className)}
      />
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl bg-muted/30", className)}>
      <div className="flex flex-wrap items-center gap-1 bg-muted/50 p-2">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="Underline"
        >
          <UnderlineIcon />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          label="Heading 1"
        >
          <Heading1 />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          label="Heading 2"
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          label="Heading 3"
        >
          <Heading3 />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullet list"
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Ordered list"
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("link")}
          onClick={openLinkDialog}
          label="Link"
        >
          <Link2 />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => setEmbedOpen(true)} label="Embed post">
          <Share2 />
          <span className="text-xs font-medium">Embed</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          label="Upload image"
          disabled={uploadingImage}
        >
          {uploadingImage ? <Loader2 className="animate-spin" /> : <ImageIcon />}
          <span className="text-xs font-medium">Image</span>
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void insertImage(file);
            event.target.value = "";
          }}
        />
      </div>

      <EditorContent editor={editor} />

      <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Embed social post</DialogTitle>
            <DialogDescription>
              Paste a YouTube, X, LinkedIn, or Instagram URL. The post will
              appear inline in your launch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="embed-url">Post URL</Label>
            <Input
              id="embed-url"
              value={embedUrl}
              onChange={(event) => setEmbedUrl(event.target.value)}
              placeholder="https://…"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  insertEmbed();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEmbedOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={insertEmbed}>
              Insert embed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add link</DialogTitle>
            <DialogDescription>
              Link the selected text, or clear the field to remove a link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://…"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyLink}>
              Apply link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="h-8 gap-1 px-2"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}
