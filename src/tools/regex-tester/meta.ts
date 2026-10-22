import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "regex-tester",
  name: "Regex Tester",
  tagline: "Test JavaScript regular expressions with live highlighting and groups.",
  description:
    "Free online regex tester for JavaScript. See matches highlighted live, inspect capture and named groups, preview replacements and use the built-in cheat sheet.",
  category: "dev",
  icon: "Regex",
  keywords: ["regex tester", "regular expression tester", "regex online", "javascript regex", "regex debugger"],
  steps: [
    "Type your regular expression and choose flags such as g (global) or i (ignore case).",
    "Paste a test string. Every match is highlighted as you type.",
    "Inspect each match's position, capture groups and named groups.",
    "Optionally enter a replacement to preview the result of String.replace.",
  ],
  faq: [
    {
      q: "Which regex flavor does this use?",
      a: "It uses your browser's JavaScript (ECMAScript) regex engine, so results match exactly what your JavaScript or TypeScript code will do.",
    },
    {
      q: "What do the flags mean?",
      a: "g finds all matches, i ignores case, m makes ^ and $ match at line breaks, s lets . match newlines, u enables Unicode mode and y (sticky) matches only at the current position.",
    },
    {
      q: "How do I reference groups in the replacement?",
      a: "Use $1, $2 and so on for numbered groups, $<name> for named groups and $& for the entire match.",
    },
    {
      q: "Why does my pattern show only one match?",
      a: "Without the g flag a regular expression stops after the first match. Turn on g to find every match.",
    },
  ],
};
