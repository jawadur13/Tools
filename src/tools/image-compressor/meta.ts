import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "image-compressor",
  name: "Image Compressor",
  tagline: "Reduce image size in KB without visible quality loss. Works offline.",
  description:
    "Compress JPG, PNG and WebP images online for free. Reduce file size, resize and convert in bulk. Images are processed in your browser and never uploaded.",
  category: "image",
  icon: "ImageDown",
  keywords: [
    "image compressor",
    "compress image",
    "reduce image size",
    "compress jpg",
    "resize image",
    "image to webp",
  ],
  popular: true,
  steps: [
    "Drop one or more JPG, PNG or WebP images into the box, or click to choose files.",
    "Set the quality, an optional maximum width, and the output format.",
    "Compare the original and compressed sizes for each image.",
    "Download the images you want, one by one or all at once.",
  ],
  faq: [
    {
      q: "Are my images uploaded to a server?",
      a: "No. Compression happens entirely inside your browser, so your photos never leave your device. You can even use the tool offline once the page has loaded.",
    },
    {
      q: "What quality setting should I use?",
      a: "Around 70–80% gives a large size reduction with no visible difference for most photos. Lower values shrink the file further but can introduce artifacts.",
    },
    {
      q: "How do I get an image under 100KB or 50KB?",
      a: "Lower the quality and set a maximum width (for example 1200px). Switching the output to WebP usually gives the smallest files at the same quality.",
    },
    {
      q: "Why did my PNG get bigger?",
      a: "PNG is lossless, so the quality slider doesn't apply to it. For photos, convert to JPG or WebP to get a much smaller file.",
    },
  ],
};
