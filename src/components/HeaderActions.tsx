"use client";

import { ChevronRight, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category } from "@/tools/types";
import { CategoryIcon, categoryStyle } from "./categoryStyle";
import { openSearch, ShortcutHint } from "./CommandPalette";

type Props = { categories: (Category & { count: number })[] };

/** Search trigger + mobile menu. Desktop category links live in SiteHeader. */
export function HeaderActions({ categories }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu after navigating (adjusting state during render, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-muted shadow-card transition hover:border-accent/40 hover:text-foreground md:flex"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 text-left">Search tools…</span>
        <ShortcutHint />
      </button>

      <button
        type="button"
        onClick={openSearch}
        aria-label="Search tools"
        className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-foreground md:hidden"
      >
        <Search className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-hidden />
          <nav
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-x-3 top-3 animate-pop-in rounded-2xl border border-line bg-surface p-3 shadow-pop"
          >
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="text-sm font-semibold text-muted">Browse categories</p>
              <button
                type="button"
                autoFocus
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-2"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-surface-2">
                    <span className={`flex size-10 items-center justify-center rounded-lg ring-1 ring-inset ${categoryStyle[c.slug].tile}`}>
                      <CategoryIcon slug={c.slug} className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{c.name}</span>
                      <span className="block text-xs text-muted">{c.count} tools</span>
                    </span>
                    <ChevronRight className="size-4 text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/" className="btn-primary mt-3 w-full">
              See all tools
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
