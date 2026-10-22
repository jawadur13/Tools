import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "word-counter",
  name: "Word Counter",
  tagline: "Count words, characters, sentences and reading time as you type.",
  description:
    "Free online word counter. Instantly count words, characters (with and without spaces), sentences, paragraphs and reading time. Works with any language.",
  category: "text",
  icon: "LetterText",
  keywords: ["word counter", "character counter", "count words", "letter count", "reading time"],
  steps: [
    "Type or paste your text into the box.",
    "Word, character, sentence and paragraph counts update instantly.",
    "Check the reading and speaking time and the most used keywords.",
  ],
  faq: [
    {
      q: "Does it work with Bangla and other languages?",
      a: "Yes. Words are counted across all scripts, including Bangla, Arabic and Hindi. Character counts use real characters, so emoji count as one.",
    },
    {
      q: "How is reading time calculated?",
      a: "Reading time assumes an average of 225 words per minute, and speaking time assumes 140 words per minute.",
    },
    {
      q: "Is my text saved anywhere?",
      a: "No. Your text stays in your browser and is never sent to a server.",
    },
  ],
};
