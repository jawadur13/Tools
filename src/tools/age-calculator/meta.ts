import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "age-calculator",
  name: "Age Calculator",
  tagline: "Find your exact age in years, months and days, plus your next birthday.",
  description:
    "Free age calculator. Get your exact age in years, months and days, total days and hours lived, the weekday you were born and a countdown to your next birthday.",
  category: "calculator",
  icon: "Cake",
  keywords: ["age calculator", "how old am i", "date of birth calculator", "age in days", "birthday countdown"],
  steps: [
    "Enter your date of birth.",
    "Optionally change the “age at” date to calculate your age on a specific day.",
    "See your exact age, totals in months, weeks, days and hours, and your next birthday.",
  ],
  faq: [
    {
      q: "How is the exact age calculated?",
      a: "It counts complete years since your birth date, then complete months since your last birthday, then the remaining days — the same way ages are calculated on official forms.",
    },
    {
      q: "What if I was born on February 29?",
      a: "In non-leap years your birthday is counted on February 28, so you turn a year older on Feb 28 and the countdown points there.",
    },
    {
      q: "Can I calculate age on a past or future date?",
      a: "Yes. Change the “age at” date to find out how old someone was, or will be, on any day — useful for exam, job or visa age limits.",
    },
  ],
};
