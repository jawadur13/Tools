import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "json-formatter",
  name: "JSON Formatter & Validator",
  tagline: "Beautify, minify and validate JSON with clear error messages.",
  description:
    "Free online JSON formatter and validator. Beautify or minify JSON, find syntax errors by line and column, then copy or download the result. Runs in your browser.",
  category: "dev",
  icon: "Braces",
  keywords: ["json formatter", "json validator", "json beautifier", "minify json", "pretty print json"],
  steps: [
    "Paste your JSON into the input box, or click “Sample” to try an example.",
    "Choose an indentation and click “Format” to beautify, or “Minify” to compress it.",
    "If the JSON is invalid, the error message shows the line and column to fix.",
    "Copy the result or download it as a .json file.",
  ],
  faq: [
    {
      q: "Is my JSON sent to a server?",
      a: "No. Formatting and validation happen entirely in your browser, so it is safe to paste API responses, configs and other private data.",
    },
    {
      q: "Why is my JSON invalid?",
      a: "The most common causes are trailing commas, single quotes instead of double quotes, unquoted keys and comments. JSON allows none of these.",
    },
    {
      q: "What is the difference between formatting and minifying?",
      a: "Formatting adds line breaks and indentation so JSON is easy to read. Minifying removes all unnecessary whitespace to make the file as small as possible.",
    },
    {
      q: "Is there a size limit?",
      a: "There is no fixed limit. Files of several megabytes format instantly on most devices.",
    },
  ],
};
