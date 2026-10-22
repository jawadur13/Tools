# JR Tools — tools.jawadurrafid.com

Free online tools that run entirely in the browser. Built with Next.js 16, Tailwind v4, `pdf-lib` and `qrcode`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Adding a tool

1. Create `src/tools/<slug>/meta.ts` (name, category, lucide icon, SEO text, steps, FAQ) and `src/tools/<slug>/Tool.tsx` (a `"use client"` component, default export). The folder name must equal the slug.
2. Run `npm run tools:sync`. It regenerates `registry.ts`, `loaders.tsx` and `ToolIcon.tsx` — don't edit those by hand.

The homepage, search, category pages, sitemap, related tools and 404 handling all pick it up automatically.

Shared building blocks: `FileDrop`, `FileList` and `CopyButton` in `src/components`, file helpers in `src/lib/files.ts`, and `downloadAsZip` in `src/lib/zip.ts` for multi-file downloads.

## Deploying

Import the repo in Vercel, then add `tools.jawadurrafid.com` as a domain (CNAME → `cname.vercel-dns.com`).
