import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "timestamp-converter",
  name: "Unix Timestamp Converter",
  tagline: "Convert Unix timestamps to dates and back, in seconds or milliseconds.",
  description:
    "Free Unix timestamp converter. Turn epoch seconds or milliseconds into UTC, local, ISO 8601 and RFC 2822 dates, or convert any date back to a timestamp.",
  category: "dev",
  icon: "Timer",
  keywords: ["unix timestamp converter", "epoch converter", "timestamp to date", "date to timestamp", "epoch time"],
  steps: [
    "Paste a Unix timestamp. Seconds and milliseconds are detected automatically.",
    "Read the date in UTC, your local time, ISO 8601, RFC 2822 and relative form.",
    "To go the other way, pick a date and time and choose local time or UTC.",
    "Copy any value with one click.",
  ],
  faq: [
    {
      q: "What is a Unix timestamp?",
      a: "It is the number of seconds that have passed since 1 January 1970 00:00:00 UTC (the Unix epoch). It is the same everywhere in the world, which makes it ideal for storing times in databases and APIs.",
    },
    {
      q: "How do you tell seconds from milliseconds?",
      a: "Values of 100,000,000,000 or more are treated as milliseconds, smaller ones as seconds. A 13-digit number is almost always milliseconds (JavaScript's Date.now()), a 10-digit number is seconds.",
    },
    {
      q: "What about the year 2038 problem?",
      a: "Systems that store timestamps as signed 32-bit integers overflow on 19 January 2038. This converter uses 64-bit numbers, so it handles dates far beyond 2038.",
    },
    {
      q: "Does it handle dates before 1970?",
      a: "Yes. Dates before the epoch are simply negative timestamps, for example -86400 is 31 December 1969.",
    },
  ],
};
