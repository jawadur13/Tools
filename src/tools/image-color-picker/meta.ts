import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "image-color-picker",
  name: "Image Color Picker",
  tagline: "Pick any color from an image and get its HEX, RGB and HSL codes.",
  description:
    "Pick colors from any image online. Click a pixel to get its HEX, RGB and HSL code, keep a history of picks and extract the image's dominant color palette.",
  category: "image",
  icon: "Pipette",
  keywords: ["color picker from image", "image color picker", "get color from image", "hex color from picture", "color palette from image"],
  steps: [
    "Drop an image into the box or click to choose one.",
    "Move over the image to see a magnified view, then click to pick a color.",
    "Copy the HEX, RGB or HSL code — your recent picks are saved below.",
    "Use the extracted palette to see the image's main colors at a glance.",
  ],
  faq: [
    {
      q: "How accurate is the picked color?",
      a: "The color is read from the exact pixel you click at the image's full resolution, so it matches the file precisely.",
    },
    {
      q: "How is the color palette created?",
      a: "The image is sampled and similar colors are grouped together with k-means clustering. The six biggest groups become the palette, most common first.",
    },
    {
      q: "Can I use it on screenshots?",
      a: "Yes. Take a screenshot, save it, and drop it in to pick colors from any website, app or design.",
    },
    {
      q: "Is my image uploaded?",
      a: "No. The image is read inside your browser and never leaves your device.",
    },
  ],
};
