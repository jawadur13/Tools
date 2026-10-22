import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "organize-pdf",
  name: "Organize PDF",
  tagline: "Reorder, delete and rotate PDF pages with a visual preview.",
  description:
    "Organize PDF pages online for free. Reorder, delete and rotate pages with thumbnails, then save a new PDF. Files are processed in your browser, never uploaded.",
  category: "pdf",
  icon: "LayoutGrid",
  keywords: ["organize pdf", "delete pdf pages", "reorder pdf pages", "rearrange pdf", "remove pages from pdf"],
  popular: true,
  steps: [
    "Drop a PDF into the box to see a thumbnail of every page.",
    "Use the arrows to move pages, the rotate button to turn them, and the trash button to delete them.",
    "Click “Save PDF” to build a new document in your chosen order.",
    "Download the organized PDF.",
  ],
  faq: [
    {
      q: "How do I delete pages from a PDF?",
      a: "Click the trash icon on every page you don't want, then save. The new PDF contains only the pages you kept, in the order shown.",
    },
    {
      q: "Is my PDF uploaded?",
      a: "No. Thumbnails are rendered and the new PDF is built entirely in your browser, so the document never leaves your device.",
    },
    {
      q: "Will the quality change?",
      a: "No. Pages are copied as-is into the new file — text stays selectable and images keep their original resolution.",
    },
    {
      q: "Can I undo a deleted page?",
      a: "Deleted pages are only removed from the preview. Click “Start over” to reload the original order with every page restored.",
    },
  ],
};
