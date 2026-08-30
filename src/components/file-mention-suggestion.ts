"use client";

import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import { PluginKey } from "@tiptap/pm/state";
import {
  FileMentionList,
  type FileMentionItem,
  type FileMentionListRef,
} from "@/components/file-mention-list";

export function createFileMention(searchFiles: (query: string) => Promise<FileMentionItem[]>) {
  return Mention.extend({
    parseHTML() {
      return [
        { tag: 'span[data-type="mention"]' },
        { tag: 'a[data-type="mention"]' },
      ];
    },
  }).configure({
    HTMLAttributes: {
      class:
        "rounded-sm bg-muted px-1 py-0.5 font-medium text-primary no-underline",
    },
    suggestion: {
      char: "#",
      pluginKey: new PluginKey("fileMention"),
      debounce: 150,
      items: async ({ query }) => {
        try {
          return await searchFiles(query);
        } catch {
          return [];
        }
      },
      render: () => {
        let component: ReactRenderer<FileMentionListRef> | undefined;
        let unmount: (() => void) | undefined;

        return {
          onStart(props) {
            component = new ReactRenderer(FileMentionList, {
              editor: props.editor,
              props: {
                items: props.items,
                command: props.command,
                loading: props.loading,
              },
            });
            unmount = props.mount(component.element);
          },
          onUpdate(props) {
            component?.updateProps({
              items: props.items,
              command: props.command,
              loading: props.loading,
            });
          },
          onKeyDown(props) {
            if (props.event.key === "Escape") {
              unmount?.();
              return true;
            }
            return component?.ref?.onKeyDown(props) ?? false;
          },
          onExit() {
            unmount?.();
            component?.destroy();
          },
        };
      },
    },
  });
}
