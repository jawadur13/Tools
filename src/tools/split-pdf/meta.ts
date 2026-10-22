import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "split-pdf",
  name: "Split PDF",
  tagline: "Extract pages from a PDF or split it into single pages.",
  description:
    "Split PDF files online for free. Extract a page range like 1-3, 5 into a new PDF, or split every page into its own file. Runs in your browser, no upload.",
  category: "pdf",
  icon: "Scissors",
  keywords: ["split pdf", "extract pdf pages", "separate pdf pages", "pdf splitter", "split pdf into pages"],
  popular: true,
  steps: [
    "Drop a PDF into the box, or click to choose it.",
    "Choose “Extract pages” and type the pages you want (for example 1-3, 5, 8-10), or choose “Split every page”.",
    "Click the button to create your new PDF files.",
    "Download the result.",
  ],
  faq: [
    {
      q: "How do I write the page selection?",
      a: "Separate pages and ranges with commas: “1-3, 5, 8-10” extracts pages 1, 2, 3, 5, 8, 9 and 10 into one PDF, in that order.",
    },
    {
      q: "Is splitting a PDF safe for private documents?",
      a: "Yes. The PDF is processed locally in your browser and is never uploaded to any server.",
    },
    {
      q: "Does splitting reduce quality?",
      a: "No. Pages are copied exactly as they are — text, images and links keep their original quality.",
    },
  ],
};
