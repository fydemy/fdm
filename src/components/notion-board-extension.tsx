"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { MaterialBoardViews } from "@/components/material-board-views";
import {
  decodeBoardPayload,
  emptyMaterialBoard,
  encodeBoard,
} from "@/lib/material-board";

function NotionBoardNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}: NodeViewProps) {
  const board = decodeBoardPayload(String(node.attrs.payload ?? ""));
  const canEdit = editor.isEditable;

  return (
    <NodeViewWrapper
      className={selected ? "rounded-xl ring-2 ring-ring" : undefined}
    >
      <div
        className="not-prose my-4 rounded-xl border bg-background p-4"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p
            className="cursor-grab text-xs font-medium text-muted-foreground"
            data-drag-handle
            contentEditable={false}
          >
            Notion board
          </p>
          {canEdit ? (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={deleteNode}
            >
              Remove
            </button>
          ) : null}
        </div>
        <MaterialBoardViews
          board={board}
          canEdit={canEdit}
          onChange={(next) =>
            updateAttributes({ payload: encodeBoard(next) })
          }
        />
      </div>
    </NodeViewWrapper>
  );
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    notionBoard: {
      setNotionBoard: () => ReturnType;
    };
  }
}

export const NotionBoard = Node.create({
  name: "notionBoard",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      payload: {
        default: encodeBoard(emptyMaterialBoard()),
        parseHTML: (element) =>
          element.getAttribute("data-notion-board") ??
          encodeBoard(emptyMaterialBoard()),
        renderHTML: (attributes) => {
          if (!attributes.payload) return {};
          return { "data-notion-board": attributes.payload };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-notion-board]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setNotionBoard:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { payload: encodeBoard(emptyMaterialBoard()) },
          }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(NotionBoardNodeView);
  },
});
