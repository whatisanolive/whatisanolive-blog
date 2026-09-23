import { Binary, Cpu, Palette, type LucideProps } from "lucide-react";

import type { Section } from "@/lib/sections";

const ICONS = {
  cpu: Cpu,
  binary: Binary,
  palette: Palette,
} as const;

/** Resolves a section's `iconName` to a component, so `lib/sections.ts` stays plain data. */
export function SectionIcon({
  name,
  ...props
}: { name: Section["iconName"] } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}
