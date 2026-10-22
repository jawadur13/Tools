import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "lorem-ipsum-generator",
  name: "Lorem Ipsum Generator",
  tagline: "Generate placeholder text by paragraphs, sentences or words.",
  description:
    "Free lorem ipsum generator. Create dummy placeholder text by paragraphs, sentences or words, optionally wrapped in HTML <p> tags, and copy it in one click.",
  category: "text",
  icon: "Pilcrow",
  keywords: ["lorem ipsum generator", "placeholder text", "dummy text generator", "lorem ipsum", "filler text"],
  steps: [
    "Choose whether you want paragraphs, sentences or words.",
    "Set how many you need.",
    "Toggle the classic “Lorem ipsum dolor sit amet” opening or HTML <p> tags if you like.",
    "Copy the text into your design or layout.",
  ],
  faq: [
    {
      q: "What is lorem ipsum?",
      a: "Lorem ipsum is scrambled Latin placeholder text that designers have used since the 1500s. It fills layouts with realistic-looking text without distracting readers with meaningful content.",
    },
    {
      q: "Why not just use real text?",
      a: "Real text makes people read and critique the words instead of the design. Lorem ipsum keeps the focus on layout, typography and spacing.",
    },
    {
      q: "What does the HTML option do?",
      a: "It wraps each paragraph in <p> tags so you can paste the text straight into HTML or a CMS code view.",
    },
  ],
};
