import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "barcode-generator",
  name: "Barcode Generator",
  tagline: "Create EAN, UPC, Code 128 and other barcodes as PNG or SVG.",
  description:
    "Free barcode generator. Create Code 128, EAN-13, EAN-8, UPC, Code 39 and ITF-14 barcodes, customize size and colors, and download as PNG or SVG. No sign-up.",
  category: "marketing",
  icon: "Barcode",
  keywords: ["barcode generator", "ean 13 barcode", "upc barcode generator", "code 128 generator", "free barcode maker"],
  steps: [
    "Choose a barcode format — Code 128 works for almost any text.",
    "Type the value to encode. Invalid values are flagged instantly.",
    "Adjust bar width, height, colors and whether the text is shown.",
    "Download the barcode as PNG for documents or SVG for print.",
  ],
  faq: [
    {
      q: "Which barcode format should I use?",
      a: "Use EAN-13 (or UPC in North America) for retail products, ITF-14 for shipping cartons, and Code 128 for anything else such as inventory labels or serial numbers.",
    },
    {
      q: "Why is my EAN-13 value rejected?",
      a: "EAN-13 needs 12 or 13 digits. With 12 digits the check digit is calculated for you; with 13 the last digit must be the correct check digit.",
    },
    {
      q: "Can I sell products with these barcodes?",
      a: "The barcode image is free to use, but retail EAN/UPC numbers must be registered with GS1 so they are unique to your company.",
    },
    {
      q: "PNG or SVG?",
      a: "SVG stays perfectly sharp at any size, which is best for printing labels. PNG is easiest for documents and websites.",
    },
  ],
};
