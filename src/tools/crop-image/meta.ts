import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "crop-image",
  name: "Crop Image",
  tagline: "Crop photos to any size or aspect ratio — 1:1, 16:9, 4:5 and more.",
  description:
    "Crop images online for free. Drag to select an area, pick an aspect ratio like 1:1, 16:9 or 4:5 and download in the original format. Nothing is uploaded.",
  category: "image",
  icon: "Crop",
  keywords: ["crop image", "crop photo online", "image cropper", "crop picture", "crop image 1:1", "crop to 16:9"],
  popular: true,
  steps: [
    "Drop an image into the box or click to choose one.",
    "Pick an aspect ratio, or keep it free to crop any shape.",
    "Drag the box to move it and drag the corners to resize it. Fine-tune with the pixel fields.",
    "Click “Crop & download” to save the cropped image.",
  ],
  faq: [
    {
      q: "Does cropping reduce image quality?",
      a: "No. The cropped area is copied pixel for pixel from the original, so it keeps its full resolution and sharpness.",
    },
    {
      q: "Which aspect ratio should I use?",
      a: "Use 1:1 for profile pictures and Instagram posts, 4:5 for tall Instagram posts, 16:9 for YouTube and presentations, and 9:16 for stories and reels.",
    },
    {
      q: "Is my image uploaded to a server?",
      a: "No. The image is cropped inside your browser and never leaves your device.",
    },
    {
      q: "What format is the cropped image saved in?",
      a: "The same format as the original: JPG stays JPG, PNG stays PNG (with transparency) and WebP stays WebP.",
    },
  ],
};
