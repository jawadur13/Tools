import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "utm-builder",
  name: "UTM Builder",
  tagline: "Build campaign URLs with UTM parameters to track every click in Google Analytics.",
  description:
    "Free UTM builder. Add utm_source, utm_medium and utm_campaign to any link with quick presets for Facebook, Google and email, then copy your tracking URL.",
  category: "marketing",
  icon: "Megaphone",
  keywords: ["utm builder", "utm generator", "campaign url builder", "utm link", "google analytics utm"],
  steps: [
    "Paste the page URL you want to send people to.",
    "Pick a quick preset or fill in the source, medium and campaign name.",
    "Optionally add a term and content value to tell ads or links apart.",
    "Copy the finished tracking URL and use it in your ad, post or email.",
  ],
  faq: [
    {
      q: "What are UTM parameters?",
      a: "UTM parameters are short tags added to the end of a URL. Analytics tools like Google Analytics read them to show which campaign, source and medium brought each visitor.",
    },
    {
      q: "Which UTM fields are required?",
      a: "utm_source, utm_medium and utm_campaign are the core three. utm_term and utm_content are optional and mostly used to separate keywords or ad variations.",
    },
    {
      q: "Should I use uppercase or lowercase?",
      a: "Always lowercase. UTM values are case-sensitive, so “Facebook” and “facebook” show up as two different sources in your reports.",
    },
    {
      q: "Will UTM tags break my existing link?",
      a: "No. Existing query parameters in your URL are kept, and the UTM values are added alongside them.",
    },
  ],
};
