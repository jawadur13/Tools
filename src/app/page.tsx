import { CircleCheck, Lock, MousePointerClick, Upload, Zap } from "lucide-react";
import { ToolBrowser } from "@/components/ToolBrowser";
import { toSummary } from "@/lib/search";
import { site } from "@/lib/site";
import { categories } from "@/tools/categories";
import { getTool, getToolsByCategory, tools } from "@/tools/registry";

// Hand-picked for the spotlight: the jobs people search for most.
const spotlight = ["image-compressor", "merge-pdf", "qr-code-generator", "pdf-to-jpg", "password-generator", "image-resizer"];
const quickSearches = ["compress image", "merge pdf", "qr code", "word count", "resize"];

const trust = ["100% free", "No sign-up", "Files never uploaded"];

const steps = [
  { icon: MousePointerClick, title: "Pick a tool", text: "Search or browse by category — every tool is one click away." },
  { icon: Upload, title: "Add your file or text", text: "Drop it in. It's opened by your browser, not sent to a server." },
  { icon: Zap, title: "Get the result instantly", text: "Download or copy the result in seconds. No queue, no watermark." },
];

export default function Home() {
  const activeCategories = categories.filter((c) => getToolsByCategory(c.slug).length > 0);
  const featured = spotlight.flatMap((slug) => {
    const tool = getTool(slug);
    return tool ? [toSummary(tool)] : [];
  });

  return (
    <section className="relative">
      <div className="hero-bg pointer-events-none absolute inset-x-0 top-0 h-[680px]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="pb-10 pt-16 text-center sm:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-muted shadow-card backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {tools.length} free tools · runs in your browser
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl sm:leading-[1.05]">
            Every tool you need.
            <br />
            <span className="bg-gradient-to-r from-accent to-violet-500 bg-clip-text text-transparent">Nothing uploaded.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted">
            {site.name} has free tools for images, PDFs, text, marketing and more. They run right in your browser, so
            your files stay private on your device.
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium">
            {trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CircleCheck className="size-4 text-success" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <ToolBrowser
          tools={tools.map(toSummary)}
          categories={activeCategories}
          featured={featured}
          quickSearches={quickSearches}
        />

        <section className="mt-24 overflow-hidden rounded-3xl border border-line bg-surface shadow-card" aria-labelledby="private">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Lock className="size-6" aria-hidden />
              </span>
              <h2 id="private" className="mt-5 text-3xl font-bold tracking-tight">
                Private by design
              </h2>
              <p className="mt-3 text-muted">
                Most online tools upload your files to their servers. {site.name} doesn&apos;t. Every tool runs inside
                your browser, so your photos, documents and text never leave your device — it even works offline once the
                page has loaded.
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="rounded-2xl bg-surface-2 p-5">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-accent" aria-hidden />
                    <span className="text-xs font-semibold text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </section>
  );
}
