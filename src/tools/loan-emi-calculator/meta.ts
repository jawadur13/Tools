import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "loan-emi-calculator",
  name: "Loan EMI Calculator",
  tagline: "Work out your monthly loan instalment, total interest and repayment schedule.",
  description:
    "Free loan EMI calculator. Enter the loan amount, interest rate and tenure to see your monthly instalment, total interest and a full amortization schedule.",
  category: "calculator",
  icon: "HandCoins",
  keywords: ["emi calculator", "loan calculator", "home loan emi", "car loan calculator", "amortization schedule"],
  popular: true,
  steps: [
    "Enter the loan amount and pick your currency.",
    "Enter the annual interest rate and the loan tenure in years or months.",
    "See your monthly EMI, the total interest and the total amount payable.",
    "Expand the schedule to see how each payment splits into principal and interest.",
  ],
  faq: [
    {
      q: "What is an EMI?",
      a: "EMI (Equated Monthly Instalment) is the fixed amount you pay the lender every month until the loan is repaid. Each EMI covers that month's interest plus part of the principal.",
    },
    {
      q: "How is EMI calculated?",
      a: "EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the number of monthly instalments.",
    },
    {
      q: "Why is most of my early EMI interest?",
      a: "Interest is charged on the outstanding balance, which is highest at the start. As you repay principal the interest portion shrinks and more of each EMI goes towards the principal.",
    },
    {
      q: "Does this include fees or insurance?",
      a: "No. It calculates the standard reducing-balance EMI. Processing fees, insurance and taxes vary by bank, so check your loan offer for the exact total.",
    },
  ],
};
