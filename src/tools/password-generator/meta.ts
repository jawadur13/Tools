import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "password-generator",
  name: "Password Generator",
  tagline: "Create strong, random passwords with one click.",
  description:
    "Free strong password generator. Create secure random passwords up to 128 characters with letters, numbers and symbols. Generated on your device, never sent anywhere.",
  category: "dev",
  icon: "KeyRound",
  keywords: ["password generator", "strong password generator", "random password", "secure password", "password maker"],
  popular: true,
  steps: [
    "Choose the password length with the slider — 16 or more characters is recommended.",
    "Pick which character types to include, and exclude look-alike characters if needed.",
    "Set how many passwords you want; a new set is generated instantly.",
    "Click the copy button next to a password to use it.",
  ],
  faq: [
    {
      q: "Are these passwords really random and secure?",
      a: "Yes. Passwords are generated with your browser's cryptographically secure random number generator (crypto.getRandomValues), using unbiased sampling. They are created on your device and never sent or stored anywhere.",
    },
    {
      q: "How long should my password be?",
      a: "Use at least 12 characters for everyday accounts and 16 or more for email, banking and password managers. Length adds more strength than complexity.",
    },
    {
      q: "What does the strength meter measure?",
      a: "It shows the password's entropy in bits — how many guesses an attacker would need. Above 80 bits is considered very strong against offline cracking.",
    },
    {
      q: "What are ambiguous characters?",
      a: "Characters that look alike in many fonts, such as I, l, 1, O and 0. Excluding them makes passwords easier to read and type by hand.",
    },
  ],
};
