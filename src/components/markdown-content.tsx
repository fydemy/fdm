"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import parse, { type DOMNode, Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SocialEmbedFrame } from "@/components/social-embed-frame";
import { LinkBadge } from "@/components/link-badge";
import { MaterialBoardViews } from "@/components/material-board-views";
import { parseHttpUrl } from "@/lib/link-preview";
import {
  decodeBoardPayload,
  encodeBoard,
  type MaterialBoard,
} from "@/lib/material-board";
import {
  getSocialEmbedSrc,
  getYoutubeEmbedUrl,
  isHtmlContent,
} from "@/lib/embeds";

type MarkdownContentProps = {
  content: string;
  youtubeUrl?: string | null;
  socialEmbeds?: string[];
  canEditBoard?: boolean;
  onBoardChange?: (previousPayload: string, board: MaterialBoard) => void;
};

export function MarkdownContent({
  content,
  youtubeUrl,
  socialEmbeds = [],
  canEditBoard = false,
  onBoardChange,
}: MarkdownContentProps) {
  const youtubeEmbed = getYoutubeEmbedUrl(youtubeUrl);

  return (
    <div className="space-y-6 py-12">
      {isHtmlContent(content) ? (
        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-sm prose-img:rounded-none prose-headings:scroll-mt-20 prose-a:text-primary">
          {renderRichHtml(content, { canEditBoard, onBoardChange })}
        </div>
      ) : (
        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-sm prose-img:rounded-none prose-headings:scroll-mt-20 prose-a:text-primary">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a({ href, children }) {
                if (!href || !parseHttpUrl(href)) {
                  return <a href={href}>{children}</a>;
                }
                return <LinkBadge href={href} />;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}

      {youtubeEmbed && (
        <div className="aspect-video overflow-hidden rounded-xl border bg-muted">
          <iframe
            src={youtubeEmbed}
            title="YouTube embed"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {socialEmbeds.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {socialEmbeds.map((url) => {
            const src = getSocialEmbedSrc(url);
            return (
              <div key={url} className="overflow-hidden rounded-xl border bg-muted/40">
                {src ? (
                  <iframe
                    src={src}
                    title={`Social embed ${url}`}
                    className="min-h-[420px] w-full"
                    loading="lazy"
                  />
                ) : (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-4 text-sm text-primary underline"
                  >
                    {url}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LiveBoard({
  initialPayload,
  canEdit,
  onBoardChange,
}: {
  initialPayload: string;
  canEdit: boolean;
  onBoardChange?: (previousPayload: string, board: MaterialBoard) => void;
}) {
  const payloadRef = useRef(initialPayload);
  const [board, setBoard] = useState(() => decodeBoardPayload(initialPayload));

  return (
    <div className="not-prose my-4 rounded-xl border bg-background p-4">
      <MaterialBoardViews
        board={board}
        canEdit={canEdit}
        onChange={(next) => {
          const previous = payloadRef.current;
          setBoard(next);
          payloadRef.current = encodeBoard(next);
          onBoardChange?.(previous, next);
        }}
      />
    </div>
  );
}

function renderRichHtml(
  content: string,
  options: {
    canEditBoard: boolean;
    onBoardChange?: (previousPayload: string, board: MaterialBoard) => void;
  },
) {
  const clean = DOMPurify.sanitize(content, {
    ADD_TAGS: ["input"],
    ADD_ATTR: [
      "data-social-embed",
      "data-notion-board",
      "data-type",
      "data-checked",
      "data-id",
      "data-label",
      "data-mention-suggestion-char",
      "target",
      "rel",
      "src",
      "alt",
      "class",
      "type",
      "checked",
      "disabled",
    ],
  });

  return parse(clean, {
    replace(domNode: DOMNode) {
      if (!isElement(domNode)) return;

      if (domNode.name === "input" && domNode.attribs?.type === "checkbox") {
        const checked =
          "checked" in (domNode.attribs ?? {}) &&
          domNode.attribs.checked !== "false";
        return (
          <input type="checkbox" checked={checked} disabled readOnly />
        );
      }

      const mentionId = domNode.attribs?.["data-id"];
      if (
        mentionId &&
        (domNode.attribs?.["data-type"] === "mention" ||
          domNode.attribs?.["data-mention-suggestion-char"])
      ) {
        const label =
          domNode.attribs["data-label"] ??
          (domNode.children?.[0] && "data" in domNode.children[0]
            ? String(domNode.children[0].data)
            : mentionId);
        return (
          <Link
            href={`/workspace/${mentionId}`}
            className="rounded-sm bg-muted px-1 py-0.5 font-medium text-primary no-underline"
          >
            {label.startsWith("#") ? label : `#${label}`}
          </Link>
        );
      }

      if (domNode.name === "a") {
        const href = domNode.attribs?.href;
        if (href && parseHttpUrl(href)) {
          const title =
            domNode.attribs["data-title"] ||
            textFromDom(domNode) ||
            undefined;
          return <LinkBadge href={href} title={title} />;
        }
      }

      if (domNode.name !== "div") return;

      const url = domNode.attribs?.["data-social-embed"];
      if (url) {
        return <SocialEmbedFrame url={url} className="not-prose my-4" />;
      }

      const payload = domNode.attribs?.["data-notion-board"];
      if (payload) {
        return (
          <LiveBoard
            initialPayload={payload}
            canEdit={options.canEditBoard}
            onBoardChange={options.onBoardChange}
          />
        );
      }
    },
  });
}

function isElement(node: DOMNode): node is Element {
  return node.type === "tag";
}

function textFromDom(node: Element): string {
  return node.children
    .map((child) => {
      if ("data" in child && typeof child.data === "string") return child.data;
      if (child.type === "tag") return textFromDom(child as Element);
      return "";
    })
    .join("")
    .trim();
}
