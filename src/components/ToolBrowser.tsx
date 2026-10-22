"use client";

import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { searchTools } from "@/lib/search";
import type { Category, ToolSummary } from "@/tools/types";
import { CategoryIcon, categoryStyle } from "./categoryStyle";
import { ToolCard } from "./ToolCard";

type Props = { tools: ToolSummary[]; categories: Category[]; featured: ToolSummary[]; quickSearches: string[] };

/** Homepage search box + category filter over the tool grid. */
export function ToolBrowser({ tools, categories, featured, quickSearches }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(
    () => searchTools(category === "all" ? tools : tools.filter((t) => t.category === category), query),
    [tools, query, category],
  );

  // Browsing everything reads better in sections; searches and filters stay a flat list.
  const grouped = category === "all" && !query.trim();
  const count = (slug: string) => tools.filter((t) => t.category === slug).length;

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        <label className="group relative block">
          <span className="sr-only">Search tools</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted transition group-focus-within:text-accent" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tools.length} tools…`}
            className="h-16 w-full rounded-2xl border border-line bg-surface pl-14 pr-12 text-base shadow-lift outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface-2"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-muted">Try:</span>
          {quickSearches.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuery(q)}
              className="rounded-full border border-line bg-surface/70 px-3 py-1 text-muted transition hover:border-accent/40 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {grouped && (
        <section className="mt-16" aria-labelledby="popular">
          <h2 id="popular" className="text-sm font-semibold uppercase tracking-wider text-muted">
            Most popular
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} featured />
            ))}
          </div>
        </section>
      )}

      <div id="all-tools" className="-mx-4 mt-14 overflow-x-auto px-4 [scrollbar-width:none]">
        <div className="flex w-max gap-2 sm:mx-auto">
          {[{ slug: "all", name: "All tools" } as const, ...categories].map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                aria-pressed={active}
                className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-line bg-surface text-muted hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {c.slug !== "all" && <span className={`size-2 rounded-full ${categoryStyle[c.slug].dot}`} aria-hidden />}
                {c.name}
                <span className={`text-xs ${active ? "opacity-70" : "opacity-60"}`}>
                  {c.slug === "all" ? tools.length : count(c.slug)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {grouped ? (
        categories.map((c) => (
          <section key={c.slug} className="mt-14" aria-labelledby={`cat-${c.slug}`}>
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-xl ring-1 ring-inset ${categoryStyle[c.slug].tile}`}>
                  <CategoryIcon slug={c.slug} className="size-5" />
                </span>
                <div>
                  <h2 id={`cat-${c.slug}`} className="text-xl font-semibold tracking-tight">
                    {c.name}
                  </h2>
                  <p className="hidden text-sm text-muted sm:block">{c.description}</p>
                </div>
              </div>
              <Link
                href={`/category/${c.slug}`}
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft"
              >
                View all <span className="hidden sm:inline">{count(c.slug)}</span>
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tools
                .filter((t) => t.category === c.slug)
                .map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
            </div>
          </section>
        ))
      ) : filtered.length > 0 ? (
        <div className="mt-8">
          <p className="mb-4 text-sm text-muted" aria-live="polite">
            {filtered.length} tool{filtered.length === 1 ? "" : "s"}
            {query.trim() && <> matching “{query.trim()}”</>}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card mt-8 px-6 py-14 text-center" aria-live="polite">
          <p className="text-lg font-semibold">No tools match “{query.trim()}”</p>
          <p className="mt-2 text-muted">Try a simpler word, or one of these:</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {quickSearches.map((q) => (
              <button key={q} type="button" onClick={() => setQuery(q)} className="btn-secondary">
                {q}
              </button>
            ))}
            {category !== "all" && (
              <button type="button" onClick={() => setCategory("all")} className="btn-secondary">
                Search all categories
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
