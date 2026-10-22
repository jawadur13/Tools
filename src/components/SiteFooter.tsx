import Link from "next/link";
import { categories } from "@/tools/categories";
import { getToolsByCategory } from "@/tools/registry";
import { otherProjects, site } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  const activeCategories = categories.filter((c) => getToolsByCategory(c.slug).length > 0);

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="flex items-center gap-2 font-bold">
            <Logo size={24} />
            {site.name}
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            {site.tagline} Free online tools that run entirely in your browser, so your files never leave your device.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Tools</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {activeCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">More projects</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {otherProjects.map((p) => (
              <li key={p.url}>
                <a href={p.url} className="hover:text-foreground">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        Built by{" "}
        <a href={site.author.url} className="hover:text-foreground">
          {site.author.name}
        </a>
        . All tools are free to use.
      </div>
    </footer>
  );
}
