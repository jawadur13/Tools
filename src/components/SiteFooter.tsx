import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { categories } from "@/tools/categories";
import { getToolsByCategory, tools } from "@/tools/registry";
import { otherProjects, site } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  const activeCategories = categories.filter((c) => getToolsByCategory(c.slug).length > 0);
  const popular = tools.filter((t) => t.popular).slice(0, 7);

  const linkClass = "rounded transition hover:text-foreground";

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <Logo size={28} />
            {site.name}
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {site.tagline} {tools.length} free tools that run in your browser, so your files stay on your device.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted">
            <ShieldCheck className="size-4 text-success" aria-hidden />
            No uploads · No tracking of your files
          </p>
        </div>
        <FooterColumn title="Categories">
          {activeCategories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className={linkClass}>
                {c.name}
              </Link>
            </li>
          ))}
        </FooterColumn>
        <FooterColumn title="Popular tools">
          {popular.map((t) => (
            <li key={t.slug}>
              <Link href={`/tools/${t.slug}`} className={linkClass}>
                {t.name}
              </Link>
            </li>
          ))}
        </FooterColumn>
        <FooterColumn title="More projects">
          {otherProjects.map((p) => (
            <li key={p.url}>
              <a href={p.url} className={linkClass}>
                {p.name}
              </a>
            </li>
          ))}
        </FooterColumn>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:flex-row">
          <p>
            Built by{" "}
            <a href={site.author.url} className="font-medium text-foreground hover:text-accent">
              {site.author.name}
            </a>
          </p>
          <p>All tools are free to use, forever.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-muted">{children}</ul>
    </div>
  );
}
