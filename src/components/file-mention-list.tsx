"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type FileMentionItem = {
  id: string;
  label: string;
};

export type FileMentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type FileMentionListProps = {
  items: FileMentionItem[];
  command: (item: FileMentionItem) => void;
  loading?: boolean;
};

export const FileMentionList = forwardRef<
  FileMentionListRef,
  FileMentionListProps
>(function FileMentionList({ items, command, loading }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === "ArrowUp") {
        setSelectedIndex((index) =>
          items.length === 0 ? 0 : (index + items.length - 1) % items.length,
        );
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((index) =>
          items.length === 0 ? 0 : (index + 1) % items.length,
        );
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="z-50 w-72 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md">
      {loading && items.length === 0 ? (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          Searching files…
        </p>
      ) : items.length === 0 ? (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          No files found
        </p>
      ) : (
        items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted",
            )}
            onMouseDown={(event) => {
              event.preventDefault();
              command(item);
            }}
          >
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{item.label}</span>
          </button>
        ))
      )}
    </div>
  );
});
