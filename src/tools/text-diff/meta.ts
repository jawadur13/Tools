import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "text-diff",
  name: "Text Compare",
  tagline: "Compare two texts and highlight every addition and deletion.",
  description:
    "Free online text compare tool. Paste two versions of a text to find the differences by line, word or character, with additions and deletions highlighted.",
  category: "text",
  icon: "Diff",
  keywords: ["text compare", "diff checker", "compare text online", "find difference between two texts", "text diff"],
  steps: [
    "Paste the original text in the left box.",
    "Paste the changed version in the right box.",
    "Choose to compare by line, word or character.",
    "Review the highlighted result: green is added, red is removed.",
  ],
  faq: [
    {
      q: "Which comparison mode should I use?",
      a: "Use “Lines” for code and lists, “Words” for documents and articles, and “Characters” to spot tiny changes like typos or punctuation.",
    },
    {
      q: "Is my text uploaded anywhere?",
      a: "No. The comparison runs entirely in your browser, so it's safe for contracts, code and other private documents.",
    },
    {
      q: "Can I compare code?",
      a: "Yes. Line mode works well for any source code, config file or CSV, and whitespace is preserved exactly.",
    },
  ],
};
