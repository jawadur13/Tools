import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "jwt-decoder",
  name: "JWT Decoder",
  tagline: "Decode JSON Web Tokens and inspect their header, payload and expiry.",
  description:
    "Free online JWT decoder. Paste a JSON Web Token to see its header and payload as formatted JSON, with issued, not-before and expiry times. Works offline.",
  category: "dev",
  icon: "ShieldCheck",
  keywords: ["jwt decoder", "decode jwt", "jwt parser", "json web token", "jwt debugger"],
  steps: [
    "Paste your JSON Web Token into the box.",
    "The header, payload and signature are color-coded and decoded instantly.",
    "Check the issued-at, not-before and expiry times and whether the token has expired.",
    "Copy the decoded header or payload as JSON.",
  ],
  faq: [
    {
      q: "Is it safe to paste my token here?",
      a: "Yes. The token is decoded entirely in your browser and never sent anywhere. Still, treat production tokens like passwords and avoid sharing them.",
    },
    {
      q: "Does this verify the signature?",
      a: "No. Decoding only reads the token's contents, which anyone can do. Verifying the signature requires the secret or public key and should happen on your server.",
    },
    {
      q: "What do exp, iat and nbf mean?",
      a: "exp is when the token expires, iat is when it was issued and nbf is the time before which it must not be accepted. All three are Unix timestamps in seconds.",
    },
  ],
};
