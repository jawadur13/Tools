"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { ToolSkeleton } from "@/components/ToolSkeleton";

/** Each tool's UI is code-split, so a page only downloads its own tool. */
const loaders: Record<string, ComponentType> = {
  "image-compressor": dynamic(() => import("./image-compressor/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "image-resizer": dynamic(() => import("./image-resizer/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "image-converter": dynamic(() => import("./image-converter/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "merge-pdf": dynamic(() => import("./merge-pdf/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "jpg-to-pdf": dynamic(() => import("./jpg-to-pdf/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "split-pdf": dynamic(() => import("./split-pdf/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "pdf-to-jpg": dynamic(() => import("./pdf-to-jpg/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "rotate-pdf": dynamic(() => import("./rotate-pdf/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "qr-code-generator": dynamic(() => import("./qr-code-generator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "whatsapp-link-generator": dynamic(() => import("./whatsapp-link-generator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "utm-builder": dynamic(() => import("./utm-builder/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "word-counter": dynamic(() => import("./word-counter/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "case-converter": dynamic(() => import("./case-converter/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "text-diff": dynamic(() => import("./text-diff/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "remove-duplicate-lines": dynamic(() => import("./remove-duplicate-lines/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "lorem-ipsum-generator": dynamic(() => import("./lorem-ipsum-generator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "password-generator": dynamic(() => import("./password-generator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "json-formatter": dynamic(() => import("./json-formatter/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "base64-encoder-decoder": dynamic(() => import("./base64-encoder-decoder/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "url-encoder-decoder": dynamic(() => import("./url-encoder-decoder/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "uuid-generator": dynamic(() => import("./uuid-generator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "hash-generator": dynamic(() => import("./hash-generator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "color-converter": dynamic(() => import("./color-converter/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "percentage-calculator": dynamic(() => import("./percentage-calculator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "age-calculator": dynamic(() => import("./age-calculator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
};

export function ToolRenderer({ slug }: { slug: string }) {
  const Tool = loaders[slug];
  return Tool ? <Tool /> : null;
}
