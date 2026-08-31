"use client";

import { useEffect } from "react";
import { Node, mergeAttributes, nodePasteRule } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { fetchLinkPreview, LinkBadge } from "@/components/link-badge";
import { hostnameFromUrl, parseHttpUrl } from "@/lib/link-preview";

const URL_REGEX =
  /https?:\/\/[\w.-]+(?:\:[0-9]+)?(?:\/[^\s]*)?/gi;

function normalizeHref(value: string) {
  const cleaned = value.replace(/[),.;!?]+$/g, "");
  return parseHttpUrl(cleaned)?.toString() ?? null;
}

function LinkBadgeNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const href = String(node.attrs.href ?? "");
  const title = node.attrs.title ? String(node.attrs.title) : null;

  useEffect(() => {
    if (!href) return;
    void fetchLinkPreview(href).then((preview) => {
      if (!preview?.title || preview.title === node.attrs.title) return;
      updateAttributes({ title: preview.title });
    });
  }, [href, node.attrs.title, updateAttributes]);

  return (
    <NodeViewWrapper as="span" className="inline">
      <LinkBadge
        href={href}
        title={title}
        className={selected ? "ring-2 ring-ring" : undefined}
      />
    </NodeViewWrapper>
  );
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    linkBadge: {
      setLinkBadge: (options: { href: string; title?: string | null }) => ReturnType;
      unsetLinkBadge: () => ReturnType;
    };
  }
}

export const LinkBadgeNode = Node.create({
  name: "linkBadge",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: (element) => element.getAttribute("href"),
        renderHTML: (attributes) =>
          attributes.href ? { href: attributes.href } : {},
      },
      title: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-title") ||
          element.textContent?.trim() ||
          null,
        renderHTML: (attributes) =>
          attributes.title ? { "data-title": attributes.title } : {},
      },
    };
  },

  parseHTML() {
    return [
      { tag: "a[data-link-badge][href]" },
      {
        tag: 'a[href]:not([data-type="mention"])',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const href = normalizeHref(element.getAttribute("href") ?? "");
          if (!href) return false;
          return {
            href,
            title:
              element.getAttribute("data-title") ||
              element.textContent?.trim() ||
              hostnameFromUrl(href),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const href = String(HTMLAttributes.href ?? "");
    const title =
      String(HTMLAttributes["data-title"] ?? HTMLAttributes.title ?? "") ||
      hostnameFromUrl(href);
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-link-badge": "",
        target: "_blank",
        rel: "noopener noreferrer",
      }),
      title,
    ];
  },

  addCommands() {
    return {
      setLinkBadge:
        (options) =>
        ({ commands }) => {
          const href = normalizeHref(options.href);
          if (!href) return false;
          return commands.insertContent({
            type: this.name,
            attrs: {
              href,
              title: options.title?.trim() || hostnameFromUrl(href),
            },
          });
        },
      unsetLinkBadge:
        () =>
        ({ commands }) =>
          commands.deleteSelection(),
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: URL_REGEX,
        type: this.type,
        getAttributes: (match) => {
          const href = normalizeHref(match[0] ?? "");
          if (!href) return {};
          return { href, title: hostnameFromUrl(href) };
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkBadgeNodeView, { as: "span" });
  },
});
