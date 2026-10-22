import type { Category, CategorySlug } from "./types";

export const categories: Category[] = [
  {
    slug: "image",
    name: "Image Tools",
    description: "Compress, resize and convert images right in your browser.",
  },
  {
    slug: "pdf",
    name: "PDF Tools",
    description: "Merge, create and convert PDF files without uploading them.",
  },
  {
    slug: "marketing",
    name: "Marketing Tools",
    description: "QR codes, links and helpers for campaigns and social media.",
  },
  {
    slug: "text",
    name: "Text Tools",
    description: "Count, clean and transform text for writing and SEO.",
  },
  {
    slug: "dev",
    name: "Developer Tools",
    description: "Formatters, encoders and converters for everyday dev work.",
  },
  {
    slug: "calculator",
    name: "Calculators",
    description: "Quick everyday calculators for percentages, ages and more.",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return categories.some((c) => c.slug === slug);
}
