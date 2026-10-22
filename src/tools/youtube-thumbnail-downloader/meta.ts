import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "youtube-thumbnail-downloader",
  name: "YouTube Thumbnail Downloader",
  tagline: "Get the full HD thumbnail of any YouTube video or Short.",
  description:
    "Download YouTube thumbnails in HD for free. Paste a video or Shorts link to get the max resolution, SD, HQ and MQ thumbnail images instantly. No sign-up.",
  category: "marketing",
  icon: "MonitorPlay",
  keywords: [
    "youtube thumbnail downloader",
    "download youtube thumbnail",
    "youtube thumbnail hd",
    "yt thumbnail grabber",
    "youtube shorts thumbnail",
  ],
  popular: true,
  steps: [
    "Copy the link of a YouTube video or Short.",
    "Paste it into the box — the video ID is detected automatically.",
    "Pick the size you need, from full HD down to medium quality.",
    "Click download to save the thumbnail as a JPG.",
  ],
  faq: [
    {
      q: "Which link formats work?",
      a: "Regular watch links, youtu.be short links, Shorts, embed and live links, mobile links, or just the 11-character video ID.",
    },
    {
      q: "Why is the max resolution version missing?",
      a: "YouTube only creates the 1280×720 thumbnail for videos uploaded in HD. For older or low-resolution videos, the HQ version is the largest available.",
    },
    {
      q: "Can I use downloaded thumbnails anywhere?",
      a: "Thumbnails belong to the video's creator. They're fine for reference or with permission, but don't reuse them commercially without the owner's consent.",
    },
  ],
};
