# tools.jawadurrafid.com — MVP design

## Goal
Public, SEO-driven library of free online tools. English only. Hosted on Vercel.
Must scale to hundreds of tools without restructuring.

## Decisions
- **Stack:** Next.js 16 (App Router) + Tailwind v4 + lucide-react icons.
- **Processing:** browser-only. Files never leave the device (selling point + zero server cost).
- **Libraries:** `qrcode` (QR), `pdf-lib` (PDF), Canvas API (image compression).

## Launch tools
1. QR Code Generator — URL/text, WiFi, email, phone; colors, size, PNG/SVG download.
2. Image Compressor — batch, quality slider, max width, JPG/WebP/PNG output, ZIP-free per-file download.
3. Merge PDF — multiple PDFs, reorder, merge to one file.
4. JPG to PDF — images (JPG/PNG/WebP) to one PDF, page size + margin options.
5. Word Counter — words, characters, sentences, paragraphs, reading time.

## Architecture
```
src/tools/<slug>/meta.ts   tool metadata (name, category, SEO text, steps, FAQ)
src/tools/<slug>/Tool.tsx  interactive client UI
src/tools/registry.ts      list of all metas + lookup helpers (server-safe)
src/tools/loaders.tsx      slug -> lazily loaded client component (ssr: false)
```
Adding a tool = new folder + one line in `registry.ts` + one line in `loaders.tsx`.

Routes, all statically generated from the registry:
- `/` hero, search, category filter, tool grid
- `/tools/[slug]` tool UI + how-to + FAQ + related tools + JSON-LD
- `/category/[slug]` tools in a category
- `/sitemap.xml`, `/robots.txt`

## SEO
Per-tool `generateMetadata` (title, description, canonical, OpenGraph), JSON-LD
`SoftwareApplication` + `FAQPage`, server-rendered content around the client tool.

## Out of scope (MVP)
Accounts, server processing, ads, analytics, i18n, PDF→Word, background removal.
