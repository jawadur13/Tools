import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "jpg-to-pdf",
  name: "JPG to PDF",
  tagline: "Turn photos and scans into a single PDF document.",
  description:
    "Convert JPG, PNG and WebP images to PDF for free. Combine multiple images into one PDF with A4, Letter or original page size. No upload, no watermark.",
  category: "pdf",
  icon: "FileImage",
  keywords: ["jpg to pdf", "image to pdf", "png to pdf", "photo to pdf", "convert jpg to pdf"],
  popular: true,
  steps: [
    "Add your JPG, PNG or WebP images by dropping them in or clicking to browse.",
    "Reorder the images — each one becomes a page in that order.",
    "Choose the page size, orientation and margin.",
    "Click “Create PDF” and download your document.",
  ],
  faq: [
    {
      q: "Will my images lose quality?",
      a: "No. Images are embedded in the PDF at their original resolution.",
    },
    {
      q: "Which page size should I choose?",
      a: "Use A4 or Letter for documents you plan to print or submit. “Fit to image” makes every page exactly the size of its image, which is ideal for photo albums.",
    },
    {
      q: "Can I convert scanned documents?",
      a: "Yes. Photos of documents taken with your phone work perfectly — add all pages and they'll be combined into one PDF.",
    },
  ],
};
