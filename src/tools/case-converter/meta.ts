import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "case-converter",
  name: "Case Converter",
  tagline: "Change text to UPPERCASE, lowercase, Title Case, camelCase and more in one click.",
  description:
    "Free online case converter. Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case or kebab-case instantly, then copy it.",
  category: "text",
  icon: "CaseSensitive",
  keywords: ["case converter", "uppercase to lowercase", "title case converter", "camelcase converter", "snake case"],
  steps: [
    "Type or paste your text into the box.",
    "Click the case you want — the text is converted instantly.",
    "Copy the result with one click.",
  ],
  faq: [
    {
      q: "What's the difference between Title Case and Sentence case?",
      a: "Title Case capitalizes the first letter of every word, like a headline. Sentence case only capitalizes the first letter of each sentence, like normal writing.",
    },
    {
      q: "What are camelCase, snake_case and kebab-case?",
      a: "They're naming styles used in programming and URLs. camelCase joins words with capitals (myVariableName), snake_case uses underscores (my_variable_name) and kebab-case uses hyphens (my-variable-name).",
    },
    {
      q: "Can I undo a conversion?",
      a: "Yes. Press Ctrl+Z (Cmd+Z on Mac) in the text box, or use the Undo button to go back to your previous text.",
    },
  ],
};
