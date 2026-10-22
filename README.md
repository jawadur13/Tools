# JR Tools — tools.jawadurrafid.com

Free online tools that run entirely in the browser. Built with Next.js 16, Tailwind v4, `pdf-lib` and `qrcode`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Adding a tool

1. Create `src/tools/<slug>/meta.ts` (name, category, SEO text, steps, FAQ) and `src/tools/<slug>/Tool.tsx` (a `"use client"` component, default export).
2. Add the meta to `src/tools/registry.ts`.
3. Add the component to `src/tools/loaders.tsx`.
4. If it uses a new lucide icon, add it to `src/components/ToolIcon.tsx`.

The homepage grid, search, category pages, sitemap, related tools and 404 handling all pick it up automatically.

## Deploying

Import the repo in Vercel, then add `tools.jawadurrafid.com` as a domain (CNAME → `cname.vercel-dns.com`).
