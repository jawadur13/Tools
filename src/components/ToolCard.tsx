import Link from "next/link";
import type { ToolMeta } from "@/tools/types";
import { ToolIcon } from "./ToolIcon";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="card group flex gap-4 p-5 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <ToolIcon name={tool.icon} className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-semibold group-hover:text-accent">
          {tool.name}
          {tool.popular && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              Popular
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm text-muted">{tool.tagline}</span>
      </span>
    </Link>
  );
}
