"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { ToolSkeleton } from "@/components/ToolSkeleton";

/** Each tool's UI is code-split, so a page only downloads its own tool. */
const loaders: Record<string, ComponentType> = {
  "qr-code-generator": dynamic(() => import("./qr-code-generator/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "image-compressor": dynamic(() => import("./image-compressor/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "merge-pdf": dynamic(() => import("./merge-pdf/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "jpg-to-pdf": dynamic(() => import("./jpg-to-pdf/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
  "word-counter": dynamic(() => import("./word-counter/Tool"), { ssr: false, loading: () => <ToolSkeleton /> }),
};

export function ToolRenderer({ slug }: { slug: string }) {
  const Tool = loaders[slug];
  return Tool ? <Tool /> : null;
}
