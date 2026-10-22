import Link from "next/link";
import { Logo } from "./Logo";
import { categories } from "@/tools/categories";
import { getToolsByCategory } from "@/tools/registry";
import { site } from "@/lib/site";

export function SiteHeader() {
  const navCategories = categories.filter((c) => getToolsByCategory(c.slug).length > 0);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight">
          <Logo size={32} />
          {site.name}
        </Link>
        <nav className="ml-auto flex items-center gap-1 overflow-x-auto text-sm">
          {navCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="whitespace-nowrap rounded-md px-3 py-2 text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {c.name.replace(" Tools", "")}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
