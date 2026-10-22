import {
  Binary,
  Braces,
  Cake,
  CaseSensitive,
  Combine,
  Diff,
  FileImage,
  FingerprintPattern,
  Hash,
  ImageDown,
  Images,
  KeyRound,
  LetterText,
  Link2,
  ListX,
  Megaphone,
  MessageCircle,
  Palette,
  Percent,
  Pilcrow,
  QrCode,
  Repeat2,
  RotateCw,
  Scaling,
  Scissors,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

// Icons are imported explicitly so only the ones in use are bundled.
const icons: Record<string, ComponentType<LucideProps>> = {
  Binary,
  Braces,
  Cake,
  CaseSensitive,
  Combine,
  Diff,
  FileImage,
  FingerprintPattern,
  Hash,
  ImageDown,
  Images,
  KeyRound,
  LetterText,
  Link2,
  ListX,
  Megaphone,
  MessageCircle,
  Palette,
  Percent,
  Pilcrow,
  QrCode,
  Repeat2,
  RotateCw,
  Scaling,
  Scissors,
};

export function ToolIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name] ?? Wrench;
  return <Icon {...props} />;
}
