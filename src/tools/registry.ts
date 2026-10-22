import type { ToolMeta } from "./types";
import { meta as imageCompressor } from "./image-compressor/meta";
import { meta as imageResizer } from "./image-resizer/meta";
import { meta as imageConverter } from "./image-converter/meta";
import { meta as mergePdf } from "./merge-pdf/meta";
import { meta as jpgToPdf } from "./jpg-to-pdf/meta";
import { meta as splitPdf } from "./split-pdf/meta";
import { meta as pdfToJpg } from "./pdf-to-jpg/meta";
import { meta as rotatePdf } from "./rotate-pdf/meta";
import { meta as qrCodeGenerator } from "./qr-code-generator/meta";
import { meta as whatsappLinkGenerator } from "./whatsapp-link-generator/meta";
import { meta as utmBuilder } from "./utm-builder/meta";
import { meta as wordCounter } from "./word-counter/meta";
import { meta as caseConverter } from "./case-converter/meta";
import { meta as textDiff } from "./text-diff/meta";
import { meta as removeDuplicateLines } from "./remove-duplicate-lines/meta";
import { meta as loremIpsumGenerator } from "./lorem-ipsum-generator/meta";
import { meta as passwordGenerator } from "./password-generator/meta";
import { meta as jsonFormatter } from "./json-formatter/meta";
import { meta as base64EncoderDecoder } from "./base64-encoder-decoder/meta";
import { meta as urlEncoderDecoder } from "./url-encoder-decoder/meta";
import { meta as uuidGenerator } from "./uuid-generator/meta";
import { meta as hashGenerator } from "./hash-generator/meta";
import { meta as colorConverter } from "./color-converter/meta";
import { meta as percentageCalculator } from "./percentage-calculator/meta";
import { meta as ageCalculator } from "./age-calculator/meta";

/** Every tool on the site, most important first within each category. Add new tools here and in loaders.tsx. */
export const tools: ToolMeta[] = [
  imageCompressor,
  imageResizer,
  imageConverter,
  mergePdf,
  jpgToPdf,
  splitPdf,
  pdfToJpg,
  rotatePdf,
  qrCodeGenerator,
  whatsappLinkGenerator,
  utmBuilder,
  wordCounter,
  caseConverter,
  textDiff,
  removeDuplicateLines,
  loremIpsumGenerator,
  passwordGenerator,
  jsonFormatter,
  base64EncoderDecoder,
  urlEncoderDecoder,
  uuidGenerator,
  hashGenerator,
  colorConverter,
  percentageCalculator,
  ageCalculator,
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
  const popular = others.filter((t) => t.category !== tool.category && t.popular);
  const rest = others.filter((t) => t.category !== tool.category && !t.popular);
  return [...sameCategory, ...popular, ...rest].slice(0, limit);
}
