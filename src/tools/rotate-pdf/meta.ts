import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "rotate-pdf",
  name: "Rotate PDF",
  tagline: "Rotate every page of a PDF and save it permanently.",
  description:
    "Rotate PDF pages online for free. Turn all pages 90° clockwise, 180° or 90° counter-clockwise and save the rotated PDF. Processed in your browser, no upload.",
  category: "pdf",
  icon: "RotateCw",
  keywords: ["rotate pdf", "rotate pdf pages", "turn pdf", "flip pdf", "rotate pdf online"],
  steps: [
    "Drop a PDF into the box, or click to choose it.",
    "Pick a rotation: 90° right, 180°, or 90° left.",
    "Click “Rotate & download” to save the rotated PDF.",
  ],
  faq: [
    {
      q: "Is the rotation permanent?",
      a: "Yes. The rotation is saved inside the new PDF, so it opens the right way in every PDF reader.",
    },
    {
      q: "Can I fix a scan that is upside down?",
      a: "Yes — choose 180° to flip upside-down pages. Use 90° right or left for pages that were scanned sideways.",
    },
    {
      q: "Does rotating change the quality?",
      a: "No. Only the page orientation changes; text and images stay exactly as they were.",
    },
  ],
};
