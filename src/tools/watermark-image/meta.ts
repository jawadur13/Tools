import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "watermark-image",
  name: "Watermark Image",
  tagline: "Add a text or logo watermark to your photos — one or many at once.",
  description:
    "Add a watermark to photos online for free. Use your own text or logo, set the size, opacity and position or tile it across the image. Batch support, no upload.",
  category: "image",
  icon: "ImagePlus",
  keywords: ["watermark image", "add watermark to photo", "logo watermark", "watermark photos online", "batch watermark"],
  steps: [
    "Drop the photos you want to protect into the box.",
    "Choose a text or logo watermark and type your text or upload your logo.",
    "Adjust the size, opacity and position — or tile it across the whole image. The preview updates live.",
    "Download each photo or all of them as a ZIP.",
  ],
  faq: [
    {
      q: "Can I watermark many photos at once?",
      a: "Yes. Add as many photos as you like. The same watermark is applied to all of them, scaled to each photo's size.",
    },
    {
      q: "What logo format works best?",
      a: "A PNG with a transparent background looks best because only your logo is drawn, not a white box around it.",
    },
    {
      q: "How do I stop people from cropping out the watermark?",
      a: "Use the “Tiled” position. It repeats the watermark diagonally across the whole image, which makes it much harder to remove.",
    },
    {
      q: "Are my photos uploaded?",
      a: "No. The watermark is added inside your browser, so your photos and logo never leave your device.",
    },
  ],
};
