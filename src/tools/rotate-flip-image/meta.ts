import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "rotate-flip-image",
  name: "Rotate & Flip Image",
  tagline: "Rotate photos 90° or 180° and mirror them horizontally or vertically.",
  description:
    "Rotate images 90°, 180° or 270° and flip them horizontally or vertically online. Works on many photos at once, keeps full quality and nothing is uploaded.",
  category: "image",
  icon: "RotateCcwSquare",
  keywords: ["rotate image", "flip image", "mirror image", "rotate photo online", "flip picture horizontally"],
  steps: [
    "Drop one or more images into the box, or click to choose them.",
    "Use the rotate and flip buttons — the previews update instantly.",
    "Download each image, or all of them at once as a ZIP.",
  ],
  faq: [
    {
      q: "Will rotating reduce my image quality?",
      a: "Rotating by 90° steps and flipping move pixels without resampling, so the image keeps its full resolution. JPG files are re-encoded at high quality.",
    },
    {
      q: "Can I rotate several photos at once?",
      a: "Yes. Add as many images as you like — the same rotation and flip are applied to all of them.",
    },
    {
      q: "What is the difference between flipping and rotating?",
      a: "Rotating turns the image around its center. Flipping mirrors it, like a reflection — handy for selfies that come out reversed.",
    },
    {
      q: "Are my photos uploaded anywhere?",
      a: "No. Everything happens in your browser and your images never leave your device.",
    },
  ],
};
