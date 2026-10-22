import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "pdf-to-jpg",
  name: "PDF to JPG",
  tagline: "Turn every page of a PDF into a high-quality JPG or PNG image.",
  description:
    "Convert PDF to JPG online for free. Save every PDF page as a high-quality JPG or PNG image at up to 3x resolution. Converted in your browser, no upload.",
  category: "pdf",
  icon: "Images",
  keywords: ["pdf to jpg", "pdf to image", "pdf to png", "convert pdf to jpg", "pdf page to image"],
  popular: true,
  steps: [
    "Drop a PDF into the box, or click to choose it.",
    "Choose the image format (JPG or PNG) and the quality: normal, high or very high.",
    "Click “Convert” and preview every page as an image.",
    "Download single pages or all of them at once.",
  ],
  faq: [
    {
      q: "Which quality should I pick?",
      a: "Normal (1x) is fine for viewing on screen. High (2x) is sharp on phones and for sharing. Very high (3x) is best for printing or zooming into small text.",
    },
    {
      q: "JPG or PNG?",
      a: "JPG gives much smaller files and is ideal for photos and scanned documents. PNG is lossless and keeps text and line art perfectly crisp.",
    },
    {
      q: "Is my PDF uploaded anywhere?",
      a: "No. Pages are rendered by your own browser, so the document never leaves your device.",
    },
  ],
};
