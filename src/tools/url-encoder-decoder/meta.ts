import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "url-encoder-decoder",
  name: "URL Encoder & Decoder",
  tagline: "Percent-encode or decode URLs and query string values.",
  description:
    "Free online URL encoder and decoder. Percent-encode text for query strings, encode full URLs, or decode %20-style URLs back to readable text instantly.",
  category: "dev",
  icon: "Link2",
  keywords: ["url encode", "url decode", "percent encoding", "urlencode online", "decode url"],
  steps: [
    "Choose Encode or Decode.",
    "Pick “Component” for a single query value, or “Full URL” to keep the URL structure intact.",
    "Paste your text or URL — the result updates as you type.",
    "Copy the result, or use Swap to reverse the conversion.",
  ],
  faq: [
    {
      q: "What is the difference between Component and Full URL?",
      a: "Component mode (encodeURIComponent) encodes every reserved character, including / ? & and =, which is right for a single query value. Full URL mode (encodeURI) leaves those characters alone so a complete URL still works.",
    },
    {
      q: "Why do spaces become %20?",
      a: "Spaces are not allowed in URLs, so they are percent-encoded as %20. Some forms use + for spaces instead; this tool decodes + as a space too.",
    },
    {
      q: "Why does decoding fail with “malformed”?",
      a: "A % sign must be followed by two hexadecimal digits that form valid UTF-8. A stray % or a truncated sequence like %E0%A6 can't be decoded.",
    },
  ],
};
