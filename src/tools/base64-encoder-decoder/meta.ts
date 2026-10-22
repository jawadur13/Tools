import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "base64-encoder-decoder",
  name: "Base64 Encoder & Decoder",
  tagline: "Encode or decode Base64 text and turn files into data URLs.",
  description:
    "Free Base64 encoder and decoder. Convert text to Base64 and back with full UTF-8 support, use URL-safe mode, or turn any file into a Base64 data URL.",
  category: "dev",
  icon: "Binary",
  keywords: ["base64 encode", "base64 decode", "base64 converter", "image to base64", "base64 online"],
  steps: [
    "Choose Encode or Decode.",
    "Type or paste your text — the result updates instantly.",
    "Turn on URL-safe mode if the result will be used in a URL or filename.",
    "To convert a file, drop it into the file box and copy the data URL.",
  ],
  faq: [
    {
      q: "Does it support emoji and non-English text?",
      a: "Yes. Text is encoded as UTF-8 before Base64, so Bangla, Arabic, Chinese and emoji all encode and decode correctly.",
    },
    {
      q: "What is URL-safe Base64?",
      a: "URL-safe Base64 replaces + with - and / with _, and drops the = padding, so the result can be used in URLs and filenames without escaping.",
    },
    {
      q: "Is Base64 encryption?",
      a: "No. Base64 is an encoding, not encryption — anyone can decode it. Never use it to protect passwords or secrets.",
    },
    {
      q: "Are my files uploaded?",
      a: "No. Files are read and converted locally in your browser.",
    },
  ],
};
