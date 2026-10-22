import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "whatsapp-link-generator",
  name: "WhatsApp Link Generator",
  tagline: "Create a wa.me click-to-chat link and QR code with a pre-filled message.",
  description:
    "Free WhatsApp link generator. Create a wa.me click-to-chat link with a pre-filled message, copy it or download a QR code. No need to save the number first.",
  category: "marketing",
  icon: "MessageCircle",
  keywords: ["whatsapp link generator", "wa.me link", "click to chat whatsapp", "whatsapp qr code", "whatsapp message link"],
  popular: true,
  steps: [
    "Choose the country code and type the WhatsApp number.",
    "Optionally write a message that will be pre-filled in the chat.",
    "Copy the link or test it with “Open in WhatsApp”.",
    "Download the QR code to put on flyers, packaging or your shop counter.",
  ],
  faq: [
    {
      q: "Do people need to save my number first?",
      a: "No. A wa.me link opens a chat with your number directly, even if the person hasn't saved you as a contact.",
    },
    {
      q: "How should I enter the phone number?",
      a: "Pick the country code and type your number as you normally would. A leading 0 (like 01712…) is removed automatically, so the link uses the international format WhatsApp needs.",
    },
    {
      q: "Can I use this link for WhatsApp Business?",
      a: "Yes. wa.me links work for both regular WhatsApp and WhatsApp Business numbers.",
    },
    {
      q: "Where can I use the link?",
      a: "Anywhere: your Facebook page button, Instagram bio, website, email signature, ads or printed QR codes.",
    },
  ],
};
