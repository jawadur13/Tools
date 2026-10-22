import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "uuid-generator",
  name: "UUID Generator",
  tagline: "Generate random v4 UUIDs (GUIDs) in bulk.",
  description:
    "Free online UUID generator. Create random version 4 UUIDs / GUIDs in bulk, with uppercase, no-hyphen and quoted formats. Copy all or download as a text file.",
  category: "dev",
  icon: "FingerprintPattern",
  keywords: ["uuid generator", "guid generator", "uuid v4", "random uuid", "bulk uuid"],
  steps: [
    "Choose how many UUIDs you need, from 1 to 500.",
    "Pick a format: uppercase, without hyphens, or wrapped in quotes.",
    "Click “Generate” to create a fresh batch.",
    "Copy them all at once or download them as a .txt file.",
  ],
  faq: [
    {
      q: "What is a UUID v4?",
      a: "A version 4 UUID is a 128-bit identifier made from random numbers, written as 32 hex digits in the 8-4-4-4-12 pattern. It's widely used for database keys and IDs.",
    },
    {
      q: "Can two UUIDs ever be the same?",
      a: "In practice, no. There are 2¹²² possible v4 UUIDs, so you would need to generate billions per second for many years to have a realistic chance of a collision.",
    },
    {
      q: "Is a GUID the same as a UUID?",
      a: "Yes. GUID is Microsoft's name for the same standard. GUIDs are often written in uppercase, which you can choose here.",
    },
  ],
};
