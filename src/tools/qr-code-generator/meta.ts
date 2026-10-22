import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "qr-code-generator",
  name: "QR Code Generator",
  tagline: "Create QR codes for links, WiFi, email and phone. Free, no sign-up.",
  description:
    "Free QR code generator. Make QR codes for URLs, WiFi, email, phone and text, pick your colors and download as PNG or SVG. No sign-up, no watermark.",
  category: "marketing",
  icon: "QrCode",
  keywords: ["qr code generator", "free qr code", "wifi qr code", "qr code maker", "qr code svg"],
  popular: true,
  steps: [
    "Choose what the QR code should contain: a link, WiFi network, email, phone number or plain text.",
    "Fill in the details. The preview updates instantly as you type.",
    "Adjust the colors, size and error correction if you like.",
    "Download your QR code as PNG for everyday use or SVG for print.",
  ],
  faq: [
    {
      q: "Do these QR codes expire?",
      a: "No. The QR codes are static: the content is encoded directly in the image, so they work forever and don't depend on our website.",
    },
    {
      q: "Can I use the QR codes commercially?",
      a: "Yes. Every QR code you create is free to use on packaging, flyers, menus, business cards and ads, with no watermark.",
    },
    {
      q: "PNG or SVG — which should I download?",
      a: "PNG is best for websites, documents and social media. SVG is a vector format that stays perfectly sharp at any size, which makes it ideal for print.",
    },
    {
      q: "What is error correction?",
      a: "Error correction lets a QR code still scan when part of it is damaged or covered. Higher levels are more robust but make the code denser.",
    },
  ],
};
