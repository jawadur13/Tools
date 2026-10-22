"use client";

import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { searchTools } from "@/lib/search";
import type { Category, ToolSummary } from "@/tools/types";
import { categoryStyle } from "./categoryStyle";
import { ToolIcon } from "./ToolIcon";

const OPEN_EVENT = "toolbox:open-search";

/** Opens the command palette from anywhere (header buttons, hero, etc.). */
export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

const noopSubscribe = () => () => {};
function useIsMac() {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
}

export function ShortcutHint({ className = "" }: { className?: string }) {
  const mac = useIsMac();
  return (
    <kbd
      className={`hidden rounded-md border border-line bg-surface px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted sm:inline-block ${className}`}
    >
      {mac ? "⌘" : "Ctrl"} K
    </kbd>
  );
}

type Props = { tools: ToolSummary[]; categories: Category[] };

export function CommandPalette({ tools, categories }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_EVENT, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Remount the panel on every open so query and selection start fresh.
  return open ? <Palette tools={tools} categories={categories} onClose={() => setOpen(false)} /> : null;
}

function Palette({ tools, categories, onClose }: Props & { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const found = query.trim() ? searchTools(tools, query) : tools.filter((t) => t.popular);
    return found.slice(0, 8);
  }, [tools, query]);
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "";
  const selected = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  function go(slug: string) {
    onClose();
    router.push(`/tools/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((selected + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((selected - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter" && results[selected]) {
      e.preventDefault();
      go(results[selected].slug);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="relative w-full max-w-xl animate-pop-in overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 shrink-0 text-muted" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search tools — try “compress”, “pdf” or “qr”"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[selected] ? `${listId}-${selected}` : undefined}
          />
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted hover:bg-surface-2" aria-label="Close search">
            <X className="size-4" />
          </button>
        </div>

        {results.length > 0 ? (
          <>
            <p className="px-4 pt-3 text-xs font-medium uppercase tracking-wide text-muted">
              {query.trim() ? "Results" : "Popular tools"}
            </p>
            <ul ref={listRef} id={listId} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
              {results.map((tool, i) => (
                <li
                  key={tool.slug}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === selected}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(tool.slug)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === selected ? "bg-surface-2" : ""}`}
                >
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${categoryStyle[tool.category].tile}`}>
                    <ToolIcon name={tool.icon} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{tool.name}</span>
                    <span className="block truncate text-xs text-muted">{tool.tagline}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted sm:block">{categoryName(tool.category)}</span>
                  {i === selected && <ArrowRight className="size-4 shrink-0 text-accent" aria-hidden />}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="font-medium">No tools match “{query}”</p>
            <p className="mt-1 text-sm text-muted">Try a simpler word like “image”, “pdf”, “text” or “convert”.</p>
          </div>
        )}

        <div className="hidden items-center gap-4 border-t border-line bg-surface-2 px-4 py-2.5 text-xs text-muted sm:flex">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1">↑</kbd>
            <kbd className="rounded border border-line bg-surface px-1">↓</kbd> to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1">
              <CornerDownLeft className="inline size-3" />
            </kbd>{" "}
            to open
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1">esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
