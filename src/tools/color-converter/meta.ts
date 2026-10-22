import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "color-converter",
  name: "Color Converter",
  tagline: "Convert colors between HEX, RGB, HSL, HSV and CMYK, with contrast checks.",
  description:
    "Free color converter. Convert HEX to RGB, HSL, HSV and CMYK instantly, generate tints and shades, and check WCAG contrast for accessible designs.",
  category: "dev",
  icon: "Palette",
  keywords: ["hex to rgb", "color converter", "rgb to hex", "hsl to hex", "color contrast checker", "cmyk converter"],
  steps: [
    "Enter a color as HEX, rgb() or hsl(), or pick one with the color picker.",
    "See it converted to HEX, RGB, HSL, HSV, CMYK and a CSS variable.",
    "Click a tint or shade to explore lighter and darker versions.",
    "Check the contrast ratio against white and black text, then copy what you need.",
  ],
  faq: [
    {
      q: "What color formats can I enter?",
      a: "3, 4, 6 or 8 digit HEX (with or without #), rgb()/rgba() and hsl()/hsla(), in both comma and space-separated syntax.",
    },
    {
      q: "What do the AA and AAA badges mean?",
      a: "They are WCAG accessibility levels. Normal text needs a contrast ratio of at least 4.5:1 for AA and 7:1 for AAA. Large text needs 3:1 for AA.",
    },
    {
      q: "Is the CMYK value print-accurate?",
      a: "It's a mathematical conversion from RGB. For exact print colors, use the ICC color profile your printer provides.",
    },
  ],
};
