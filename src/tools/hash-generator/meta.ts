import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "hash-generator",
  name: "Hash Generator",
  tagline: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from text or files.",
  description:
    "Free online hash generator. Create MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes of text or files and verify checksums. Nothing is uploaded.",
  category: "dev",
  icon: "Hash",
  keywords: ["hash generator", "md5 generator", "sha256 generator", "checksum calculator", "file hash", "sha512"],
  steps: [
    "Type or paste text, or switch to File and drop in any file.",
    "MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes are calculated instantly.",
    "Paste an expected checksum into the compare box to verify a download.",
    "Copy any hash with one click, in lowercase or uppercase.",
  ],
  faq: [
    {
      q: "Is my file uploaded to calculate the hash?",
      a: "No. Hashes are calculated in your browser with the Web Crypto API, so files of any sensitivity stay on your device.",
    },
    {
      q: "Which hash algorithm should I use?",
      a: "Use SHA-256 or stronger for anything security related. MD5 and SHA-1 are broken for security purposes but are still common for verifying file downloads.",
    },
    {
      q: "Can a hash be reversed to get the original text?",
      a: "No. Hash functions are one-way. The same input always gives the same hash, but you can't recover the input from the hash.",
    },
    {
      q: "How do I verify a downloaded file?",
      a: "Drop the file in, then paste the checksum published by the software vendor into the compare box. A green match means the file is intact and untampered.",
    },
  ],
};
