"use client";

import { useEffect, useMemo } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { MaterialBoardViews } from "@/components/material-board-views";
import { trpc } from "@/lib/trpc/client";
import {
  decodeBoardPayload,
  emptyMaterialBoard,
  encodeBoard,
} from "@/lib/material-board";

function boardIsSelected(editor: { state: { selection: unknown } }) {
  const { selection } = editor.state;
  return (
    selection instanceof NodeSelection &&
    selection.node.type.name === "notionBoard"
  );
}

function NotionBoardNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
}: NodeViewProps) {
  const payload = String(node.attrs.payload ?? "");
  const board = useMemo(() => decodeBoardPayload(payload), [payload]);
  const canEdit = editor.isEditable;
  const { data: me } = trpc.user.me.useQuery();
  const canDelete = canEdit && Boolean(me?.isReviewer);

  useEffect(() => {
    editor.storage.notionBoard.canDelete = canDelete;
  }, [canDelete, editor]);

  return (
    <NodeViewWrapper
      className={selected ? "rounded-xl ring-2 ring-ring" : undefined}
    >
      <div
        className="not-prose my-4 rounded-xl border bg-background p-4"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {canDelete ? (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={deleteNode}
            >
              Remove
            </button>
          </div>
        ) : null}
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

  interface Storage {
    notionBoard: {
      canDelete: boolean;
    };
  }
}

export const NotionBoard = Node.create({
  name: "notionBoard",
  group: "block",
  atom: true,
  draggable: false,

  addStorage() {
    return { canDelete: false };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) =>
        boardIsSelected(editor) && !editor.storage.notionBoard.canDelete,
      Delete: ({ editor }) =>
        boardIsSelected(editor) && !editor.storage.notionBoard.canDelete,
    };
  },

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
    return ReactNodeViewRenderer(NotionBoardNodeView, {
      stopEvent: () => true,
    });
  },
});
