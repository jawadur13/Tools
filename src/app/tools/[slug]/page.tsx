import { ArrowRight, ChevronRight, CircleCheck, Plus, ShieldCheck, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryStyle } from "@/components/categoryStyle";
import { ToolCard } from "@/components/ToolCard";
import { ToolIcon } from "@/components/ToolIcon";
import { site } from "@/lib/site";
import { getCategory } from "@/tools/categories";
import { ToolRenderer } from "@/tools/loaders";
import { getRelatedTools, getTool, tools } from "@/tools/registry";

const trustChips = [
  { icon: CircleCheck, label: "Free, no sign-up" },
  { icon: ShieldCheck, label: "Files stay on your device" },
  { icon: WifiOff, label: "Works offline" },
];

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const tool = getTool((await params).slug);
  if (!tool) return {};
  const title = `${tool.name} — Free Online, No Upload`;
  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: { title, description: tool.description, url: `/tools/${tool.slug}` },
  };
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  const category = getCategory(tool.category);
  const related = getRelatedTools(tool, 6);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      description: tool.description,
      url: `${site.url}/tools/${tool.slug}`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (web browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="relative">
      <div className="hero-bg pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />

        <nav aria-label="Breadcrumb" className="flex items-center gap-1 pt-8 text-sm text-muted">
          <Link href="/" className="rounded px-1 hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          {category && (
            <>
              <Link href={`/category/${category.slug}`} className="rounded px-1 hover:text-foreground">
                {category.name}
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
            </>
          )}
          <span className="truncate px-1 text-foreground" aria-current="page">
            {tool.name}
          </span>
        </nav>

        <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <span
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl shadow-card ring-1 ring-inset ${categoryStyle[tool.category].tile}`}
          >
            <ToolIcon name={tool.icon} className="size-8" />
          </span>
          <div className="min-w-0">
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{tool.name}</h1>
            <p className="mt-2 text-pretty text-lg text-muted">{tool.tagline}</p>
          </div>
        </header>
        <ul className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
          {trustChips.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-muted shadow-card">
              <Icon className="size-3.5 text-success" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <section className="mt-8" aria-label={tool.name}>
          <ToolRenderer slug={tool.slug} />
        </section>

        <section className="mt-20" aria-labelledby="how-to">
          <h2 id="how-to" className="text-2xl font-bold tracking-tight">
            How to use the {tool.name}
          </h2>
          <ol className={`mt-6 grid gap-3 sm:grid-cols-2 ${tool.steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            {tool.steps.map((step, i) => (
              <li key={step} className="card p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                  {i + 1}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-muted">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20 grid gap-8 lg:grid-cols-[1fr_2fr]" aria-labelledby="faq">
          <div>
            <h2 id="faq" className="text-2xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-muted">Everything you need to know about the {tool.name}.</p>
          </div>
          <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            {tool.faq.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex list-none items-center justify-between gap-4 px-5 py-4 font-medium transition hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus className="size-4 shrink-0 text-muted transition group-open:rotate-45" aria-hidden />
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related">
            <div className="flex items-end justify-between gap-4">
              <h2 id="related" className="text-2xl font-bold tracking-tight">
                Related tools
              </h2>
              {category && (
                <Link
                  href={`/category/${category.slug}`}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft"
                >
                  More {category.name}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
