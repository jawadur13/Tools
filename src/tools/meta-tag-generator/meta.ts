import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "meta-tag-generator",
  name: "Meta Tag Generator",
  tagline: "Create SEO, Open Graph and Twitter meta tags with a live Google preview.",
  description:
    "Free meta tag generator. Create SEO title, description, Open Graph and Twitter Card tags, preview your Google result and social card, then copy the HTML.",
  category: "marketing",
  icon: "Tags",
  keywords: ["meta tag generator", "seo meta tags", "open graph generator", "twitter card generator", "meta description"],
  steps: [
    "Enter your page title, description and URL. The counters show when text is too long for Google.",
    "Add Open Graph and Twitter details so links look great when shared on Facebook, LinkedIn and X.",
    "Check the live Google result and social card previews.",
    "Copy the generated HTML and paste it into the <head> of your page.",
  ],
  faq: [
    {
      q: "How long should a meta title and description be?",
      a: "Keep titles under about 60 characters and descriptions under about 160 characters. Longer text is usually cut off with “…” in Google results.",
    },
    {
      q: "What are Open Graph tags?",
      a: "Open Graph tags control the title, description and image shown when your page is shared on Facebook, LinkedIn, WhatsApp and many other apps.",
    },
    {
      q: "Do meta keywords still matter?",
      a: "Google ignores the keywords meta tag for ranking. It's included as an option because some internal search engines still read it.",
    },
    {
      q: "What image size should I use for social sharing?",
      a: "1200 × 630 pixels works well for Facebook, LinkedIn and X's large summary card. Use an absolute URL starting with https://.",
    },
  ],
};
