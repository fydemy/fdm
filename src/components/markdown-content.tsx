"use client";

import parse, { type DOMNode, Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SocialEmbedFrame } from "@/components/social-embed-frame";
import {
  getSocialEmbedSrc,
  getYoutubeEmbedUrl,
  isHtmlContent,
} from "@/lib/embeds";

type MarkdownContentProps = {
  content: string;
  youtubeUrl?: string | null;
  socialEmbeds?: string[];
};

export function MarkdownContent({
  content,
  youtubeUrl,
  socialEmbeds = [],
}: MarkdownContentProps) {
  const youtubeEmbed = getYoutubeEmbedUrl(youtubeUrl);

  return (
    <div className="space-y-6">
      {isHtmlContent(content) ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary">
          {renderRichHtml(content)}
        </div>
      ) : (
        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
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

function renderRichHtml(content: string) {
  const clean = DOMPurify.sanitize(content, {
    ADD_ATTR: ["data-social-embed", "target", "rel", "src", "alt", "class"],
  });

  return parse(clean, {
    replace(domNode: DOMNode) {
      if (!isElement(domNode) || domNode.name !== "div") return;

      const url = domNode.attribs?.["data-social-embed"];
      if (!url) return;

      return <SocialEmbedFrame url={url} className="not-prose my-4" />;
    },
  });
}

function isElement(node: DOMNode): node is Element {
  return node.type === "tag";
}
