"use client";

import { Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";

type Fields = {
  title: string;
  description: string;
  keywords: string;
  url: string;
  author: string;
  index: "index" | "noindex";
  follow: "follow" | "nofollow";
  ogType: string;
  image: string;
  siteName: string;
  twitterCard: "summary" | "summary_large_image";
};

const initial: Fields = {
  title: "",
  description: "",
  keywords: "",
  url: "",
  author: "",
  index: "index",
  follow: "follow",
  ogType: "website",
  image: "",
  siteName: "",
  twitterCard: "summary_large_image",
};

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildHtml(f: Fields): string {
  const lines: string[] = [];
  const meta = (attr: "name" | "property", key: string, value: string) => {
    if (value.trim()) lines.push(`<meta ${attr}="${key}" content="${escapeAttr(value.trim())}" />`);
  };

  lines.push("<!-- Primary meta tags -->");
  if (f.title.trim()) lines.push(`<title>${escapeAttr(f.title.trim())}</title>`);
  meta("name", "title", f.title);
  meta("name", "description", f.description);
  meta("name", "keywords", f.keywords);
  meta("name", "author", f.author);
  lines.push(`<meta name="robots" content="${f.index}, ${f.follow}" />`);
  if (f.url.trim()) lines.push(`<link rel="canonical" href="${escapeAttr(f.url.trim())}" />`);

  lines.push("", "<!-- Open Graph / Facebook -->");
  meta("property", "og:type", f.ogType);
  meta("property", "og:url", f.url);
  meta("property", "og:title", f.title);
  meta("property", "og:description", f.description);
  meta("property", "og:image", f.image);
  meta("property", "og:site_name", f.siteName);

  lines.push("", "<!-- Twitter / X -->");
  meta("name", "twitter:card", f.twitterCard);
  meta("name", "twitter:url", f.url);
  meta("name", "twitter:title", f.title);
  meta("name", "twitter:description", f.description);
  meta("name", "twitter:image", f.image);

  return lines.join("\n");
}

function Counter({ value, limit }: { value: string; limit: number }) {
  const n = value.length;
  const color = n === 0 ? "text-muted" : n > limit ? "text-danger" : "text-success";
  return (
    <span className={`text-xs tabular-nums ${color}`}>
      {n}/{limit}
    </span>
  );
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "example.com";
  }
}

function truncate(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

export default function MetaTagGenerator() {
  const [f, setF] = useState<Fields>(initial);
  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => setF((prev) => ({ ...prev, [key]: value }));
  const html = useMemo(() => buildHtml(f), [f]);

  const host = hostOf(f.url);
  const crumbs = f.url ? f.url.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/").join(" › ") : host;
  const title = f.title || "Your page title appears here";
  const description = f.description || "Your meta description appears here. Write a short summary that makes people want to click.";

  return (
    <div className="space-y-5">
      <div className="card grid gap-5 p-5 sm:p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="mt-title">Page title</label>
            <Counter value={f.title} limit={60} />
          </div>
          <input id="mt-title" className="field" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Free Online Tools — Fast & Private" />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="mt-desc">Meta description</label>
            <Counter value={f.description} limit={160} />
          </div>
          <textarea id="mt-desc" className="field min-h-20" value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="A short summary of the page for search results." />
        </div>
        <div>
          <label className="label" htmlFor="mt-url">Canonical URL</label>
          <input id="mt-url" className="field" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://example.com/page" />
        </div>
        <div>
          <label className="label" htmlFor="mt-kw">Keywords (comma separated)</label>
          <input id="mt-kw" className="field" value={f.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="tools, seo, free" />
        </div>
        <div>
          <label className="label" htmlFor="mt-author">Author</label>
          <input id="mt-author" className="field" value={f.author} onChange={(e) => set("author", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="mt-index">Indexing</label>
            <select id="mt-index" className="field" value={f.index} onChange={(e) => set("index", e.target.value as Fields["index"])}>
              <option value="index">index</option>
              <option value="noindex">noindex</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="mt-follow">Links</label>
            <select id="mt-follow" className="field" value={f.follow} onChange={(e) => set("follow", e.target.value as Fields["follow"])}>
              <option value="follow">follow</option>
              <option value="nofollow">nofollow</option>
            </select>
          </div>
        </div>

        <p className="border-t border-line pt-5 text-sm font-semibold md:col-span-2">Social sharing</p>
        <div>
          <label className="label" htmlFor="mt-image">Share image URL</label>
          <input id="mt-image" className="field" value={f.image} onChange={(e) => set("image", e.target.value)} placeholder="https://example.com/og-image.png" />
        </div>
        <div>
          <label className="label" htmlFor="mt-site">Site name</label>
          <input id="mt-site" className="field" value={f.siteName} onChange={(e) => set("siteName", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="mt-ogtype">Open Graph type</label>
          <select id="mt-ogtype" className="field" value={f.ogType} onChange={(e) => set("ogType", e.target.value)}>
            <option value="website">website</option>
            <option value="article">article</option>
            <option value="product">product</option>
            <option value="profile">profile</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="mt-card">Twitter card</label>
          <select id="mt-card" className="field" value={f.twitterCard} onChange={(e) => set("twitterCard", e.target.value as Fields["twitterCard"])}>
            <option value="summary_large_image">Large image</option>
            <option value="summary">Summary</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-5">
          <p className="mb-3 text-sm font-semibold">Google preview</p>
          <div className="rounded-xl bg-white p-4 text-left font-[arial,sans-serif]">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#f1f3f4] text-[#5f6368]">
                <Globe className="size-4" />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm text-[#202124]">{f.siteName || host}</p>
                <p className="truncate text-xs text-[#4d5156]">{truncate(`https://${crumbs}`, 60)}</p>
              </div>
            </div>
            <p className="mt-2 text-xl leading-snug text-[#1a0dab]">{truncate(title, 60)}</p>
            <p className="mt-1 text-sm leading-normal text-[#4d5156]">{truncate(description, 160)}</p>
          </div>
        </div>

        <div className="card p-5">
          <p className="mb-3 text-sm font-semibold">Social card preview</p>
          <div className="overflow-hidden rounded-xl border border-line bg-surface-2">
            {f.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-supplied external image
              <img src={f.image} alt="" className="aspect-[1.91/1] w-full object-cover" />
            ) : (
              <div className="flex aspect-[1.91/1] items-center justify-center text-sm text-muted">1200 × 630 image</div>
            )}
            <div className="border-t border-line p-3">
              <p className="text-xs uppercase text-muted">{host}</p>
              <p className="mt-0.5 truncate font-semibold">{title}</p>
              <p className="line-clamp-2 text-sm text-muted">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="text-sm font-semibold">Generated HTML</p>
          <CopyButton text={html} label="Copy HTML" />
        </div>
        <pre className="overflow-x-auto bg-surface-2 p-5 font-mono text-xs leading-relaxed">{html}</pre>
      </div>
    </div>
  );
}
