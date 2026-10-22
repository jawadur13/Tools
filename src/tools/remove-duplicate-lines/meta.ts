import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "remove-duplicate-lines",
  name: "Remove Duplicate Lines",
  tagline: "Delete repeated lines from lists, emails or keywords and sort what's left.",
  description:
    "Free online tool to remove duplicate lines from text. Clean lists of emails, keywords or numbers, trim spaces, drop empty lines and sort A–Z instantly.",
  category: "text",
  icon: "ListX",
  keywords: ["remove duplicate lines", "delete duplicate lines", "dedupe list", "remove duplicates online", "sort lines"],
  steps: [
    "Paste your list into the input box — one item per line.",
    "Choose whether matching is case-sensitive and whether to trim spaces or drop empty lines.",
    "Optionally sort the result A–Z or Z–A.",
    "Copy the cleaned list from the output box.",
  ],
  faq: [
    {
      q: "Which copy of a duplicate is kept?",
      a: "The first occurrence is kept and later repeats are removed, so the original order of your list is preserved unless you choose to sort it.",
    },
    {
      q: "What does case-sensitive mean here?",
      a: "With case-sensitive on, “Apple” and “apple” are treated as different lines. Turn it off to treat them as duplicates.",
    },
    {
      q: "Is there a limit on list size?",
      a: "No fixed limit. Lists with hundreds of thousands of lines are processed instantly in your browser.",
    },
  ],
};
