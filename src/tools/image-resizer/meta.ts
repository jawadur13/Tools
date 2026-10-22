import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "image-resizer",
  name: "Image Resizer",
  tagline: "Resize images to exact pixels, a percentage or social media sizes.",
  description:
    "Resize JPG, PNG and WebP images online for free. Set exact pixels, scale by percentage or use Instagram, Facebook, YouTube and passport presets. No upload.",
  category: "image",
  icon: "Scaling",
  keywords: ["image resizer", "resize image", "resize photo", "resize image to 1080x1080", "passport photo size", "change image size"],
  popular: true,
  steps: [
    "Drop one or more images into the box, or click to choose files.",
    "Pick a mode: exact pixels, percentage, or a ready-made preset such as Instagram post or YouTube thumbnail.",
    "Click “Resize images” and check the new dimensions and file sizes.",
    "Download each image, or all of them at once.",
  ],
  faq: [
    {
      q: "Will resizing stretch my image?",
      a: "Not with “Lock aspect ratio” on — the height follows the width automatically. Presets with a different shape crop from the center instead of stretching.",
    },
    {
      q: "Are my images uploaded?",
      a: "No. Resizing happens in your browser using the Canvas API, so your photos never leave your device.",
    },
    {
      q: "What size is a passport photo in pixels?",
      a: "The passport preset produces 413 × 531 pixels, which is 35 × 45 mm at 300 DPI — the size used in Bangladesh, the UK, the EU and many other countries.",
    },
    {
      q: "Can I make an image bigger?",
      a: "Yes, but enlarging can't add detail that isn't there, so large upscales may look soft. Shrinking always keeps images sharp.",
    },
  ],
};
