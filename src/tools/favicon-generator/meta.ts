import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "favicon-generator",
  name: "Favicon Generator",
  tagline: "Turn an image, letters or an emoji into a complete favicon set.",
  description:
    "Free favicon generator. Create favicon.ico, Apple touch icon and Android icons from an image, text or emoji, with the HTML code to add them to your site.",
  category: "image",
  icon: "AppWindow",
  keywords: ["favicon generator", "favicon.ico", "create favicon", "apple touch icon", "emoji favicon", "favicon from image"],
  steps: [
    "Upload a square logo or image — or switch to Text and type letters or an emoji.",
    "Choose the background, colors and corner rounding. All sizes preview instantly.",
    "Download favicon.ico and the PNG icons one by one, or everything as a ZIP.",
    "Copy the HTML snippet into the <head> of your website.",
  ],
  faq: [
    {
      q: "Which favicon files do I actually need?",
      a: "favicon.ico covers every browser, apple-touch-icon.png is used when someone adds your site to an iPhone home screen, and the 192 and 512 px icons are used by Android and installable web apps.",
    },
    {
      q: "What sizes are inside the favicon.ico?",
      a: "The .ico file contains 16×16, 32×32 and 48×48 images, so browsers and Windows can pick the sharpest one for each place it's shown.",
    },
    {
      q: "What image works best?",
      a: "A simple, square logo with bold shapes. Fine details disappear at 16×16 pixels, so a single letter or icon usually reads best.",
    },
    {
      q: "Is my logo uploaded anywhere?",
      a: "No. All icons are generated inside your browser and your image never leaves your device.",
    },
  ],
};
