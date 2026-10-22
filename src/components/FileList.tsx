"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { ReactNode } from "react";

type Item = { id: string; name: string; detail?: string; thumb?: string };

type Props = {
  items: Item[];
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
  icon?: ReactNode;
};

/** Ordered list of files with move up/down and remove controls. */
export function FileList({ items, onMove, onRemove, icon }: Props) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={item.id} className="card flex items-center gap-3 p-3">
          <span className="w-6 text-center text-sm font-semibold text-muted">{i + 1}</span>
          {item.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob URL
            <img src={item.thumb} alt="" className="size-10 rounded-md object-cover" />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent">{icon}</span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{item.name}</span>
            {item.detail && <span className="text-xs text-muted">{item.detail}</span>}
          </span>
          <button
            type="button"
            aria-label="Move up"
            disabled={i === 0}
            onClick={() => onMove(i, i - 1)}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={i === items.length - 1}
            onClick={() => onMove(i, i + 1)}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            onClick={() => onRemove(item.id)}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
          >
            <X className="size-4" />
          </button>
        </li>
      ))}
    </ol>
  );
}
