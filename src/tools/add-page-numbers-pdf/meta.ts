import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "add-page-numbers-pdf",
  name: "Add Page Numbers to PDF",
  tagline: "Number the pages of any PDF, with your choice of position and style.",
  description:
    "Add page numbers to a PDF online for free. Choose the position, format like “Page 1 of 10”, font size and starting number. No upload — works in your browser.",
  category: "pdf",
  icon: "ListOrdered",
  keywords: ["add page numbers to pdf", "pdf page numbers", "number pdf pages", "paginate pdf", "pdf page numbering"],
  steps: [
    "Drop your PDF into the box.",
    "Pick the position, number format, starting number and font size.",
    "Optionally skip the first page, for example a cover.",
    "Click “Add page numbers” and download the numbered PDF.",
  ],
  faq: [
    {
      q: "Can I skip numbering the cover page?",
      a: "Yes. Turn on “Skip first page” — the cover stays clean and numbering starts on the second page.",
    },
    {
      q: "Can numbering start from a number other than 1?",
      a: "Yes. Set any starting number, which is handy when your PDF is one chapter of a longer document.",
    },
    {
      q: "Are my files uploaded?",
      a: "No. The page numbers are drawn into the PDF inside your browser; nothing is sent to a server.",
    },
  ],
};
