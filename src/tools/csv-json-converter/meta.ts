import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "csv-json-converter",
  name: "CSV to JSON Converter",
  tagline: "Convert CSV to JSON and JSON to CSV, with a live table preview.",
  description:
    "Free CSV to JSON and JSON to CSV converter. Handles quoted fields, any delimiter and header rows, detects numbers and booleans, and runs fully in your browser.",
  category: "dev",
  icon: "FileSpreadsheet",
  keywords: ["csv to json", "json to csv", "csv converter", "convert csv to json online", "csv parser"],
  steps: [
    "Choose CSV → JSON or JSON → CSV.",
    "Paste your data or drop a .csv / .json file.",
    "Adjust the delimiter, header row and type detection if needed.",
    "Check the table preview, then copy or download the result.",
  ],
  faq: [
    {
      q: "Does it handle commas and line breaks inside values?",
      a: "Yes. The parser follows RFC 4180, so quoted fields can contain commas, line breaks and escaped double quotes (\"\").",
    },
    {
      q: "Which delimiters are supported?",
      a: "Comma, semicolon, tab and pipe. The delimiter is detected automatically from the first line, and you can override it.",
    },
    {
      q: "Why are some numbers kept as text?",
      a: "Values with leading zeros (like 007 or phone numbers) and numbers too large to store exactly are kept as strings, so no data is lost. Turn off type detection to keep every value as text.",
    },
    {
      q: "Is my data uploaded?",
      a: "No. Conversion happens entirely in your browser, so it's safe to use with private spreadsheets and exports.",
    },
  ],
};
