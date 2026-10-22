import { ogImage, ogSize } from "@/lib/og";
import { site } from "@/lib/site";
import { getCategory } from "@/tools/categories";
import { getTool, tools } from "@/tools/registry";

export const alt = `Free online tool on ${site.name}`;
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const tool = getTool((await params).slug);
  if (!tool) return ogImage({ title: site.name, subtitle: site.tagline });
  return ogImage({
    eyebrow: `Free ${getCategory(tool.category)?.name.replace(/s$/, "") ?? "tool"}`,
    title: tool.name,
    subtitle: tool.tagline,
  });
}
