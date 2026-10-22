import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "image-converter",
  name: "Image Converter",
  tagline: "Convert images between JPG, PNG and WebP in bulk.",
  description:
    "Convert images to JPG, PNG or WebP online for free. Works with PNG, JPG, WebP, GIF, BMP and AVIF, in bulk, with adjustable quality. Nothing is uploaded.",
  category: "image",
  icon: "Repeat2",
  keywords: ["image converter", "png to jpg", "jpg to png", "webp to jpg", "jpg to webp", "convert image"],
  popular: true,
  steps: [
    "Drop your images into the box, or click to choose them.",
    "Choose the format you want: JPG, PNG or WebP.",
    "For JPG and WebP, adjust the quality if you need smaller files.",
    "Click “Convert” and download your images one by one or all at once.",
  ],
  faq: [
    {
      q: "Which formats can I convert from?",
      a: "Anything your browser can open: JPG, PNG, WebP and GIF everywhere, plus BMP and AVIF in modern browsers. Animated GIFs are converted using their first frame.",
    },
    {
      q: "What happens to transparent backgrounds?",
      a: "PNG and WebP keep transparency. JPG doesn't support it, so transparent areas become white.",
    },
    {
      q: "Which format should I use?",
      a: "WebP gives the smallest files for websites. JPG works everywhere and is best for photos. PNG is lossless and best for logos, screenshots and graphics with sharp edges.",
    },
  ],
};
