import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "merge-pdf",
  name: "Merge PDF",
  tagline: "Combine multiple PDF files into one, in the order you choose.",
  description:
    "Merge PDF files online for free. Combine multiple PDFs into one document and reorder them. Files are merged in your browser and never uploaded.",
  category: "pdf",
  icon: "Combine",
  keywords: ["merge pdf", "combine pdf", "join pdf", "pdf merger", "merge pdf files free"],
  popular: true,
  steps: [
    "Drop your PDF files into the box, or click to choose them.",
    "Use the arrows to put the files in the order you want.",
    "Click “Merge PDFs” to combine them into a single document.",
    "Download your merged PDF.",
  ],
  faq: [
    {
      q: "Is it safe to merge confidential PDFs here?",
      a: "Yes. Your files are processed locally in your browser and are never uploaded to any server.",
    },
    {
      q: "Is there a file size or page limit?",
      a: "There is no fixed limit. Very large files depend on your device's memory, but typical documents of a few hundred pages merge in seconds.",
    },
    {
      q: "Can I merge password-protected PDFs?",
      a: "Encrypted PDFs need to be unlocked first. Remove the password in your PDF reader, then merge them here.",
    },
  ],
};
