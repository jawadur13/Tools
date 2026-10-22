import type { ToolSummary } from "@/tools/types";

export function toSummary({ slug, name, tagline, category, icon, keywords, popular }: ToolSummary): ToolSummary {
  return { slug, name, tagline, category, icon, keywords, popular };
}

/**
 * Ranks tools for a query. Every word must match somewhere; name matches beat
 * keyword matches, which beat tagline matches. Empty query keeps the order.
 */
export function searchTools<T extends ToolSummary>(tools: T[], query: string): T[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return tools;

  const scored = tools.flatMap((tool) => {
    const name = tool.name.toLowerCase();
    const keywords = tool.keywords.join(" ").toLowerCase();
    const tagline = tool.tagline.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (name.startsWith(w)) score += 6;
      else if (new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(name)) score += 5;
      else if (name.includes(w)) score += 4;
      else if (keywords.includes(w)) score += 3;
      else if (tagline.includes(w)) score += 1;
      else return [];
    }
    return [{ tool, score: score + (tool.popular ? 0.5 : 0) }];
  });

  return scored.sort((a, b) => b.score - a.score).map((s) => s.tool);
}
