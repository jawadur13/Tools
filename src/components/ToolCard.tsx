import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ToolSummary } from "@/tools/types";
import { categoryStyle } from "./categoryStyle";
import { ToolIcon } from "./ToolIcon";

type Props = { tool: ToolSummary; /** Larger card used in the Popular spotlight. */ featured?: boolean };

export function ToolCard({ tool, featured = false }: Props) {
  const style = categoryStyle[tool.category];
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`card group relative flex gap-4 transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift ${
        featured ? "items-start p-4 sm:flex-col sm:p-6" : "items-start p-4"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center ring-1 ring-inset ${style.tile} ${
          featured ? "size-11 rounded-xl sm:size-12 sm:rounded-2xl" : "size-11 rounded-xl"
        }`}
      >
        <ToolIcon name={tool.icon} className={featured ? "size-6" : "size-5"} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`font-semibold tracking-tight ${featured ? "sm:text-lg" : ""}`}>{tool.name}</span>
          {tool.popular && !featured && (
            <span className="shrink-0 rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-highlight">
              Popular
            </span>
          )}
        </span>
        <span className={`mt-1 line-clamp-2 block text-muted ${featured ? "text-sm sm:text-[15px]" : "text-sm"}`}>{tool.tagline}</span>
      </span>
      <ArrowUpRight
        className="absolute right-4 top-4 size-4 text-muted opacity-0 transition group-hover:opacity-100 group-hover:text-accent"
        aria-hidden
      />
    </Link>
  );
}
