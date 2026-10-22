export type CategorySlug = "image" | "pdf" | "marketing" | "text" | "dev";

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
