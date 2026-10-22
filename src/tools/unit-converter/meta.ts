import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "unit-converter",
  name: "Unit Converter",
  tagline: "Convert length, weight, temperature, area, volume, speed, time and data units.",
  description:
    "Free unit converter for length, weight, temperature, area, volume, speed, time and data — including Bangladeshi land units like decimal, katha and bigha.",
  category: "calculator",
  icon: "Ruler",
  keywords: ["unit converter", "katha to square feet", "decimal to katha", "cm to inches", "kg to lbs", "celsius to fahrenheit"],
  popular: true,
  steps: [
    "Pick a category such as length, weight or area.",
    "Enter a value and choose the units to convert from and to.",
    "Use the swap button to reverse the conversion.",
    "See the value converted to every other unit in the category at once.",
  ],
  faq: [
    {
      q: "How many square feet are in a katha, decimal and bigha?",
      a: "Using the standard values in Bangladesh: 1 decimal (shotangsho) = 435.6 sq ft, 1 katha = 720 sq ft and 1 bigha = 20 katha = 14,400 sq ft. 1 acre = 100 decimal = 43,560 sq ft. Local measures can vary by region, so confirm with your land office for legal documents.",
    },
    {
      q: "What's the difference between MB and MiB?",
      a: "MB (megabyte) uses powers of 1000, so 1 MB = 1,000,000 bytes. MiB (mebibyte) uses powers of 1024, so 1 MiB = 1,048,576 bytes. Drive makers use MB/GB, while many operating systems show MiB/GiB, which is why a 500 GB drive shows about 465 GB.",
    },
    {
      q: "How much is one bhori (tola) of gold?",
      a: "One bhori or tola is 11.664 grams. It is the traditional unit for gold and silver in Bangladesh and India.",
    },
    {
      q: "Are US and UK gallons the same?",
      a: "No. A US gallon is 3.785 litres, while a UK (imperial) gallon is 4.546 litres. The converter lists both.",
    },
  ],
};
