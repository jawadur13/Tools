import type { ToolMeta } from "./types";
import { meta as qrCodeGenerator } from "./qr-code-generator/meta";
import { meta as imageCompressor } from "./image-compressor/meta";
import { meta as mergePdf } from "./merge-pdf/meta";
import { meta as jpgToPdf } from "./jpg-to-pdf/meta";
import { meta as wordCounter } from "./word-counter/meta";

/** Every tool on the site. Add new tools here and in loaders.tsx. */
export const tools: ToolMeta[] = [
  qrCodeGenerator,
  imageCompressor,
  mergePdf,
  jpgToPdf,
  wordCounter,
];

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): ToolMeta[] {
  return tools.filter((t) => t.category === category);
}

/** Same-category tools first, then popular ones, excluding the tool itself. */
export function getRelatedTools(tool: ToolMeta, limit = 4): ToolMeta[] {
  const others = tools.filter((t) => t.slug !== tool.slug);
  const sameCategory = others.filter((t) => t.category === tool.category);
  const rest = others.filter((t) => t.category !== tool.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
