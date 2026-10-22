import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "percentage-calculator",
  name: "Percentage Calculator",
  tagline: "Work out percentages, percentage change and discounts instantly.",
  description:
    "Free percentage calculator. Find X% of a number, what percent one number is of another, percentage increase or decrease, and add or subtract a percent.",
  category: "calculator",
  icon: "Percent",
  keywords: ["percentage calculator", "percent of a number", "percentage change", "percentage increase", "discount calculator"],
  popular: true,
  steps: [
    "Pick the calculator that matches your question.",
    "Enter your numbers — the answer updates as you type.",
    "Read the result along with the formula used to get it.",
  ],
  faq: [
    {
      q: "How do I calculate a percentage of a number?",
      a: "Multiply the number by the percentage and divide by 100. For example, 20% of 150 is 150 × 20 ÷ 100 = 30.",
    },
    {
      q: "How is percentage change calculated?",
      a: "Subtract the old value from the new value, divide by the old value and multiply by 100. Going from 80 to 100 is a 25% increase.",
    },
    {
      q: "How do I work out a discounted price?",
      a: "Use “Add or subtract a percentage”: choose subtract, enter the discount percent and the original price. 15% off 2,000 is 1,700.",
    },
    {
      q: "Why is a 50% increase followed by a 50% decrease not the original value?",
      a: "The second percentage applies to a different base. 100 + 50% = 150, but 150 − 50% = 75.",
    },
  ],
};
