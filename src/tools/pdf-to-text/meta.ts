import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "pdf-to-text",
  name: "PDF to Text",
  tagline: "Extract all the text from a PDF so you can copy, edit or save it.",
  description:
    "Convert PDF to text online for free. Extract the text from every page, copy it or download it as a .txt file. Works in your browser — your PDF is never uploaded.",
  category: "pdf",
  icon: "FileType",
  keywords: ["pdf to text", "extract text from pdf", "pdf to txt", "copy text from pdf", "pdf text extractor"],
  steps: [
    "Drop a PDF into the box.",
    "The text of every page is extracted automatically.",
    "Toggle page separators if you want to see where each page starts.",
    "Copy the text or download it as a .txt file.",
  ],
  faq: [
    {
      q: "Why is no text found in my PDF?",
      a: "Scanned PDFs and photos of documents contain images of text, not real text. They need OCR (text recognition), which this tool doesn't do.",
    },
    {
      q: "Is the formatting kept?",
      a: "Line breaks are kept where the PDF marks them, but fonts, columns and tables become plain text.",
    },
    {
      q: "Is my PDF uploaded?",
      a: "No. Text is extracted entirely inside your browser and never sent to a server.",
    },
  ],
};
