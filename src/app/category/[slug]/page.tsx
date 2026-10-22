import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  return (
    <div className="mx-auto max-w-6xl px-4 pt-16">
      <h1 className="text-4xl font-bold tracking-tight">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{category.description}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
