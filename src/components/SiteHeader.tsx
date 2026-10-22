import Link from "next/link";
import { categories } from "@/tools/categories";
import { getToolsByCategory } from "@/tools/registry";
import { site } from "@/lib/site";
import { HeaderActions } from "./HeaderActions";
import { Logo } from "./Logo";

export function SiteHeader() {
  const navCategories = categories
    .map((c) => ({ ...c, count: getToolsByCategory(c.slug).length }))
    .filter((c) => c.count > 0);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <Link href="/" className="mr-4 flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-tight">
          <Logo size={32} />
          {site.name}
        </Link>
        <nav aria-label="Categories" className="hidden items-center gap-0.5 text-sm lg:flex">
          {navCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              {c.name.replace(" Tools", "")}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <HeaderActions categories={navCategories} />
        </div>
      </div>
    </header>
  );
}
