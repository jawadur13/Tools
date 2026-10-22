import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "bmi-calculator",
  name: "BMI Calculator",
  tagline: "Check your Body Mass Index and healthy weight range in metric or imperial.",
  description:
    "Free BMI calculator. Enter your height and weight in cm/kg or feet/pounds to get your Body Mass Index, WHO weight category and healthy weight range.",
  category: "calculator",
  icon: "HeartPulse",
  keywords: ["bmi calculator", "body mass index", "calculate bmi", "healthy weight calculator", "bmi kg cm"],
  popular: true,
  steps: [
    "Choose metric (cm, kg) or imperial (feet, inches, pounds) units.",
    "Enter your height and weight.",
    "See your BMI, its WHO category and where it falls on the scale.",
    "Check the healthy weight range for your height.",
  ],
  faq: [
    {
      q: "What is a healthy BMI?",
      a: "For adults, the World Health Organization considers a BMI between 18.5 and 24.9 a normal weight. Below 18.5 is underweight, 25–29.9 is overweight and 30 or more is obesity.",
    },
    {
      q: "Are the cut-offs different for South Asians?",
      a: "Yes. Because health risks rise at lower BMIs in Asian populations, the WHO suggests lower action points for Asians: 23 and above may indicate increased risk and 27.5 and above high risk. Doctors in Bangladesh and India often use these lower thresholds.",
    },
    {
      q: "Is BMI accurate for everyone?",
      a: "BMI is a quick screening tool, not a diagnosis. It doesn't distinguish muscle from fat, so athletes may score as overweight, and it isn't meant for children, teenagers or pregnant women. Talk to a doctor for a full assessment.",
    },
    {
      q: "How is BMI calculated?",
      a: "BMI is your weight in kilograms divided by your height in metres squared. For example, 70 kg at 1.75 m gives 70 ÷ (1.75 × 1.75) ≈ 22.9.",
    },
  ],
};
