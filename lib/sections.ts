import type { Category } from "@prisma/client";

/**
 * The three top-level pillars.
 *
 * Colour lives in CSS, not here. Each pillar has a `[data-pillar]` block in
 * `globals.css` that redefines the semantic tokens, so components can be
 * written once against `bg-ground` / `text-brand` and retheme automatically.
 */

export type SectionKey = "tech" | "dsa" | "blank-canvas";

export type Section = {
  key: SectionKey;
  category: Category;
  href: `/${SectionKey}`;
  title: string;
  tagline: string;
  description: string;
  /** Resolved to a component in `components/SectionIcon.tsx`. */
  iconName: "cpu" | "binary" | "palette";
};

export const SECTIONS: Record<SectionKey, Section> = {
  tech: {
    key: "tech",
    category: "TECH",
    href: "/tech",
    title: "Tech",
    tagline: "Systems, servers & the math under the model",
    description:
      "Software engineering, system design, backend architecture, and the theory behind machine learning.",
    iconName: "cpu",
  },
  dsa: {
    key: "dsa",
    category: "DSA",
    href: "/dsa",
    title: "DSA",
    tagline: "Patterns, invariants & the cost of everything",
    description:
      "My daily dose of dopamine! The patterns make it fun and data structures give things order.",
    iconName: "binary",
  },
  "blank-canvas": {
    key: "blank-canvas",
    category: "BLANK_CANVAS",
    href: "/blank-canvas",
    title: "Blank Canvas",
    tagline: "Essays, experiments & everything else",
    description:
      "Personal essays, creative design experiments, summaries of books, and thoughts that refuse a category.",
    iconName: "palette",
  },
};

export const SECTION_ORDER: SectionKey[] = ["tech", "dsa", "blank-canvas"];

const SECTION_BY_CATEGORY: Record<Category, Section> = {
  TECH: SECTIONS.tech,
  DSA: SECTIONS.dsa,
  BLANK_CANVAS: SECTIONS["blank-canvas"],
};

export function sectionForCategory(category: Category): Section {
  return SECTION_BY_CATEGORY[category];
}

/** The CSS variable holding this section's hue (deep on light, pastel on dark). */
export function hueVar(key: SectionKey) {
  return `var(--hue-${key})`;
}

/** The section page filtered to one tag. */
export function tagHref(sectionHref: Section["href"], tagName: string) {
  return `${sectionHref}?tag=${encodeURIComponent(tagName)}`;
}
