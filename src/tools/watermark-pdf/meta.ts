import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "watermark-pdf",
  name: "Watermark PDF",
  tagline: "Stamp “CONFIDENTIAL”, “DRAFT” or any text across every PDF page.",
  description:
    "Add a text watermark to a PDF for free. Set the text, size, color, opacity and angle, centered or tiled across every page. Processed in your browser, never uploaded.",
  category: "pdf",
  icon: "Stamp",
  keywords: ["watermark pdf", "add watermark to pdf", "pdf watermark", "confidential stamp pdf", "draft watermark"],
  steps: [
    "Drop the PDF you want to watermark.",
    "Type your watermark text, for example “CONFIDENTIAL”.",
    "Adjust the size, color, opacity, angle and layout (centered or tiled).",
    "Click “Add watermark” and download the result.",
  ],
  faq: [
    {
      q: "Can the watermark be removed later?",
      a: "The text is drawn into each page's content, so it can't be switched off like a comment. Keep your original file if you need an unmarked copy.",
    },
    {
      q: "What opacity should I use?",
      a: "Around 15–25% keeps the document readable while making the watermark clearly visible. Use a higher value for a stronger mark.",
    },
    {
      q: "Does it work with scanned PDFs?",
      a: "Yes. The watermark is drawn on top of each page, whether the page contains text or a scanned image.",
    },
    {
      q: "Is my document uploaded?",
      a: "No. Everything happens locally in your browser, which makes it safe for confidential files.",
    },
  ],
};
