import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon, categoryStyle } from "@/components/categoryStyle";
import { ToolCard } from "@/components/ToolCard";
import { categories, getCategory } from "@/tools/categories";
import { getToolsByCategory } from "@/tools/registry";

export function generateStaticParams() {
  return categories.filter((c) => getToolsByCategory(c.slug).length > 0).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  return {
    title: `Free Online ${category.name}`,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const list = getToolsByCategory(category.slug);
  if (list.length === 0) notFound();
  const others = categories.filter((c) => c.slug !== category.slug && getToolsByCategory(c.slug).length > 0);

  return (
    <div className="relative">
      <div className="hero-bg pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 pt-8 text-sm text-muted">
          <Link href="/" className="rounded px-1 hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="px-1 text-foreground" aria-current="page">
            {category.name}
          </span>
        </nav>

        <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <span
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl shadow-card ring-1 ring-inset ${categoryStyle[category.slug].tile}`}
          >
            <CategoryIcon slug={category.slug} className="size-8" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Free online {category.name.toLowerCase()}</h1>
            <p className="mt-2 max-w-2xl text-lg text-muted">
              {category.description} {list.length} tools, all free and private.
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>

        <section className="mt-20" aria-labelledby="more-categories">
          <h2 id="more-categories" className="text-xl font-semibold tracking-tight">
            Explore other categories
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift"
                >
                  <span className={`flex size-10 items-center justify-center rounded-xl ring-1 ring-inset ${categoryStyle[c.slug].tile}`}>
                    <CategoryIcon slug={c.slug} className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{c.name}</span>
                    <span className="block text-xs text-muted">{getToolsByCategory(c.slug).length} tools</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
