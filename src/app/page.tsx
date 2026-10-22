import { Gift, Lock, Zap } from "lucide-react";
import { ToolBrowser } from "@/components/ToolBrowser";
import { site } from "@/lib/site";
import { categories } from "@/tools/categories";
import { getToolsByCategory, tools } from "@/tools/registry";

const perks = [
  { icon: Lock, title: "Private by design", text: "Files are processed on your device and never uploaded." },
  { icon: Zap, title: "Instant", text: "No queues, no waiting for servers. Results in seconds." },
  { icon: Gift, title: "Free forever", text: "No sign-up, no watermarks, no daily limits." },
];

export default function Home() {
  const activeCategories = categories.filter((c) => getToolsByCategory(c.slug).length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="pb-8 pt-16 text-center sm:pt-24">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="size-1.5 rounded-full bg-success" />
          {tools.length} free tools · 100% in your browser
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Every tool you need.
          <br />
          <span className="text-accent">Nothing uploaded.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          {site.name} has {tools.length} free tools for images, PDFs, text, marketing and more. They run right in your
          browser, so your files never leave your device.
        </p>
      </section>

      <ToolBrowser tools={tools} categories={activeCategories} />

      <section className="mt-24 grid gap-4 sm:grid-cols-3">
        {perks.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <Icon className="size-5 text-accent" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
