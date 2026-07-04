"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { SocialEmbedFrame } from "@/components/social-embed-frame";

function SocialEmbedNodeView({ node, deleteNode, selected }: NodeViewProps) {
  const url = String(node.attrs.url ?? "");

  return (
    <NodeViewWrapper
      className={selected ? "rounded-xl ring-2 ring-ring" : undefined}
      data-drag-handle
    >
      <SocialEmbedFrame url={url} onRemove={deleteNode} />
    </NodeViewWrapper>
  );
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    socialEmbed: {
      setSocialEmbed: (options: { url: string }) => ReturnType;
    };
  }
}

export const SocialEmbed = Node.create({
  name: "socialEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-social-embed"),
        renderHTML: (attributes) => {
          if (!attributes.url) return {};
          return { "data-social-embed": attributes.url };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-social-embed]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setSocialEmbed:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { url: options.url },
          }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(SocialEmbedNodeView);
  },
});
