import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "text-to-speech",
  name: "Text to Speech",
  tagline: "Read any text aloud with natural voices in dozens of languages.",
  description:
    "Free online text to speech. Paste text and listen with natural voices in many languages, adjust speed and pitch, and follow along with word highlighting.",
  category: "text",
  icon: "AudioLines",
  keywords: ["text to speech", "tts online", "read text aloud", "text to voice", "speech synthesizer"],
  steps: [
    "Type or paste the text you want to hear.",
    "Pick a language and voice, then adjust the speed, pitch and volume.",
    "Press Play. The current word is highlighted while it's read aloud.",
    "Pause, resume or stop at any time.",
  ],
  faq: [
    {
      q: "Which languages are supported?",
      a: "The voices come from your device and browser. Chrome, Edge and Safari usually include many languages, and Edge offers especially natural “Online” voices. Bangla voices are available on many Android and Windows devices.",
    },
    {
      q: "Can I download the audio as MP3?",
      a: "Not with this tool. The browser's speech API plays audio directly and doesn't give websites access to the sound file, which is also why your text never leaves your device.",
    },
    {
      q: "Why don't I see any voices?",
      a: "Some browsers load voices a moment after the page opens, and a few (like some Linux browsers) ship without voices. Try reloading the page or using Chrome or Edge.",
    },
    {
      q: "Is there a text length limit?",
      a: "No. Long text is split into sentences behind the scenes so playback doesn't cut off partway through.",
    },
  ],
};
