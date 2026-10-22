import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "time-zone-converter",
  name: "Time Zone Converter",
  tagline: "Convert a time between Dhaka, London, New York and any other time zone.",
  description:
    "Free time zone converter. See what time it is in Dhaka, London, New York, Dubai and 400+ other zones, with daylight saving time handled automatically.",
  category: "calculator",
  icon: "Earth",
  keywords: ["time zone converter", "bangladesh time to usa time", "dhaka time", "utc converter", "meeting time planner"],
  steps: [
    "Pick a date and time, and the time zone it's in (your own zone is selected by default).",
    "Add the cities or time zones you want to compare.",
    "Read the converted time, date and UTC offset for each zone, with +1 / −1 day markers.",
    "Click “Now” to jump back to the current time.",
  ],
  faq: [
    {
      q: "Does it handle daylight saving time?",
      a: "Yes. Offsets come from your browser's built-in time zone database, so zones like London and New York automatically switch between standard and summer time on the right dates.",
    },
    {
      q: "What is Bangladesh's time zone?",
      a: "Bangladesh Standard Time (Asia/Dhaka) is UTC+06:00 all year. Bangladesh does not currently use daylight saving time.",
    },
    {
      q: "What is the time difference between Bangladesh and the USA?",
      a: "It depends on the US time zone and the season. New York is 10 hours behind Dhaka in summer (EDT) and 11 hours behind in winter (EST). Los Angeles is 13 or 14 hours behind.",
    },
    {
      q: "What does +1 day mean?",
      a: "It means the converted time falls on the next calendar day compared with the time you entered, which often happens when converting from Asia to the Americas.",
    },
  ],
};
