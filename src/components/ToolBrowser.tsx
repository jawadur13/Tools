"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category, ToolMeta } from "@/tools/types";
import { ToolCard } from "./ToolCard";

type Props = { tools: ToolMeta[]; categories: Category[] };

/** Homepage search box + category filter over the tool grid. */
export function ToolBrowser({ tools, categories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return [t.name, t.tagline, ...t.keywords].some((s) => s.toLowerCase().includes(q));
    });
  }, [tools, query, category]);

  const chips = [{ slug: "all", name: "All tools" }, ...categories];
  // Browsing everything reads better in sections; searches and filters stay a flat list.
  const grouped = category === "all" && !query.trim();

  return (
    <div>
      <label className="relative mx-auto block max-w-xl">
        <span className="sr-only">Search tools</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools — e.g. “compress”, “pdf”, “qr”"
          className="field h-14 rounded-2xl pl-12 text-base shadow-sm"
        />
      </label>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setCategory(c.slug)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              category === c.slug
                ? "border-accent bg-accent text-accent-fg"
                : "border-line bg-surface text-muted hover:text-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {grouped ? (
        categories.map((c) => (
          <section key={c.slug} className="mt-12">
            <h2 className="text-lg font-semibold">{c.name}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .filter((t) => t.category === c.slug)
                .map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
            </div>
          </section>
        ))
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
      {filtered.length === 0 && (
        <p className="mt-10 text-center text-muted">No tools match “{query}” yet — more are coming soon.</p>
      )}
    </div>
  );
}
