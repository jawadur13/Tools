import { Calculator, CodeXml, FileText, Image, Megaphone, Type, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import type { CategorySlug } from "@/tools/types";

type Style = { icon: ComponentType<LucideProps>; tile: string; dot: string };

// Full class strings so Tailwind can see them. Each category gets its own hue
// so people can scan the grid by color as well as by name.
export const categoryStyle: Record<CategorySlug, Style> = {
  image: {
    icon: Image,
    tile: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
    dot: "bg-sky-500",
  },
  pdf: {
    icon: FileText,
    tile: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
    dot: "bg-rose-500",
  },
  marketing: {
    icon: Megaphone,
    tile: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500",
  },
  text: {
    icon: Type,
    tile: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  dev: {
    icon: CodeXml,
    tile: "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20",
    dot: "bg-violet-500",
  },
  calculator: {
    icon: Calculator,
    tile: "bg-teal-50 text-teal-700 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/20",
    dot: "bg-teal-500",
  },
};

export function CategoryIcon({ slug, className }: { slug: CategorySlug; className?: string }) {
  const Icon = categoryStyle[slug].icon;
  return <Icon className={className} aria-hidden />;
}
