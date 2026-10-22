export type CategorySlug = "image" | "pdf" | "marketing" | "text" | "dev" | "calculator";

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
};

export type ToolMeta = {
  slug: string;
  name: string;
  /** Short line shown on cards and under the H1. */
  tagline: string;
  /** Meta description for search results (~150 chars). */
  description: string;
  category: CategorySlug;
  /** lucide-react icon name, resolved in components/ToolIcon. */
  icon: string;
  keywords: string[];
  steps: string[];
  faq: { q: string; a: string }[];
  popular?: boolean;
};

/** The fields needed to list and search tools — what gets sent to the browser. */
export type ToolSummary = Pick<ToolMeta, "slug" | "name" | "tagline" | "category" | "icon" | "keywords" | "popular">;
