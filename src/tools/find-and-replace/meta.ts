import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "find-and-replace",
  name: "Find and Replace",
  tagline: "Search and replace text in bulk, with whole-word and regex options.",
  description:
    "Free online find and replace tool. Replace words or phrases in any text at once, with case-sensitive, whole word and regular expression options and undo.",
  category: "text",
  icon: "Replace",
  keywords: ["find and replace", "replace text online", "bulk replace", "search and replace", "regex replace"],
  steps: [
    "Paste your text into the box.",
    "Type what to find and what to replace it with. Matches are highlighted and counted instantly.",
    "Turn on case-sensitive, whole word or regex matching if you need to.",
    "Click “Replace all”, then copy the result. Use Undo if you change your mind.",
  ],
  faq: [
    {
      q: "What does “whole word” do?",
      a: "It only matches complete words. Searching for “cat” with whole word on won't change “category” or “concatenate”.",
    },
    {
      q: "How do I use regular expressions?",
      a: "Turn on Regex and write a JavaScript regular expression, for example \\d+ for numbers. In the replacement you can use $1, $2 for captured groups or $& for the whole match.",
    },
    {
      q: "Can I replace line breaks?",
      a: "Yes. Turn on Regex and search for \\n to match line breaks, then replace them with a space or anything else.",
    },
    {
      q: "Is my text sent anywhere?",
      a: "No. Everything happens in your browser and your text never leaves your device.",
    },
  ],
};
