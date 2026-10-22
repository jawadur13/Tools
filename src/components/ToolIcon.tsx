import {
  Combine,
  FileImage,
  ImageDown,
  LetterText,
  QrCode,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

// Icons are imported explicitly so only the ones in use are bundled.
const icons: Record<string, ComponentType<LucideProps>> = {
  Combine,
  FileImage,
  ImageDown,
  LetterText,
  QrCode,
};

export function ToolIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name] ?? Wrench;
  return <Icon {...props} />;
}
