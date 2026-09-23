import "server-only";

import type { Category } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";
import { SECTIONS, SECTION_ORDER } from "@/lib/sections";
import { site } from "@/lib/site";

/*
  Site copy that's editable at /admin/settings.

  Read through these helpers, never straight from the table: they merge the
  saved row over the defaults in lib/site.ts and lib/sections.ts, so an empty
  field falls back instead of rendering a blank page. Cached and tagged, so
  saving settings updates every page at once.
*/

export const SETTINGS_TAG = "site-settings";

export type SiteSettingsValues = {
  siteName: string;
  tagline: string;
  description: string;
  email: string;
  github: string;
  footerBlurb: string;
  heroLead: string;
  heroHighlight: string;
  heroIntro: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsValues = {
  siteName: site.name,
  tagline: site.title,
  description: site.description,
  email: site.email,
  github: site.github,
  footerBlurb:
    "Notes on the systems I build, the algorithms I unpack, and the things that do not fit in either box.",
  heroLead: "Learning, writing and order, here is everything I",
  heroHighlight: "love",
  heroIntro:
    "Long-form notes on backend systems and machine learning, the algorithmic patterns worth internalising, and the occasional essay that belongs to neither. No listicles, no hedging — just the working.",
};

export type SectionCopyValues = { tagline: string; description: string };
export type SectionCopy = Record<Category, SectionCopyValues>;

export const DEFAULT_SECTION_COPY: SectionCopy = {
  TECH: { tagline: SECTIONS.tech.tagline, description: SECTIONS.tech.description },
  DSA: { tagline: SECTIONS.dsa.tagline, description: SECTIONS.dsa.description },
  BLANK_CANVAS: {
    tagline: SECTIONS["blank-canvas"].tagline,
    description: SECTIONS["blank-canvas"].description,
  },
};

const fallback = (value: string | undefined | null, byDefault: string) =>
  value && value.trim() ? value.trim() : byDefault;

export async function getSiteSettings(): Promise<SiteSettingsValues> {
  "use cache";

  cacheLife("days");
  cacheTag(SETTINGS_TAG);

  const saved = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  if (!saved) return DEFAULT_SITE_SETTINGS;

  return Object.fromEntries(
    Object.entries(DEFAULT_SITE_SETTINGS).map(([key, byDefault]) => [
      key,
      fallback(saved[key as keyof SiteSettingsValues], byDefault),
    ]),
  ) as SiteSettingsValues;
}

export async function getSectionCopy(): Promise<SectionCopy> {
  "use cache";

  cacheLife("days");
  cacheTag(SETTINGS_TAG);

  const saved = await prisma.sectionSettings.findMany();
  const savedByCategory = new Map(saved.map((row) => [row.category, row]));

  const copy = { ...DEFAULT_SECTION_COPY };
  for (const key of SECTION_ORDER) {
    const category = SECTIONS[key].category;
    const row = savedByCategory.get(category);
    copy[category] = {
      tagline: fallback(row?.tagline, DEFAULT_SECTION_COPY[category].tagline),
      description: fallback(row?.description, DEFAULT_SECTION_COPY[category].description),
    };
  }
  return copy;
}

/** A section's static parts (key, href, icon) merged with its editable copy. */
export async function getSectionsWithCopy() {
  const copy = await getSectionCopy();
  return SECTION_ORDER.map((key) => ({
    ...SECTIONS[key],
    ...copy[SECTIONS[key].category],
  }));
}
