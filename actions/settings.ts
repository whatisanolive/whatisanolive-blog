"use server";

import { Category, Role } from "@prisma/client";
import { updateTag } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/require-admin";
import { DEFAULT_SITE_SETTINGS, SETTINGS_TAG } from "@/lib/settings";

export type SettingsFormState = {
  error?: string;
  /** Changes on every successful save, so the form can show a confirmation. */
  savedAt?: number;
};

const line = (max: number) => z.string().trim().max(max);

// Partial on purpose: the Site card and the Homepage card each submit only
// their own fields, and a save must not blank out the other card's values.
const siteSchema = z
  .object({
    siteName: line(60).min(1, "The site needs a name."),
    tagline: line(120),
    description: line(300),
    email: z.union([z.string().trim().email("That email doesn't look right."), z.literal("")]),
    github: z.union([z.string().trim().url("That link doesn't look right."), z.literal("")]),
    footerBlurb: line(300),
    heroLead: line(200),
    heroHighlight: line(40),
    heroIntro: line(600),
  })
  .partial();

export async function updateSiteSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  if (!(await getAdminUser())) return { error: "Unauthorized" };

  const parsed = siteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Some fields are invalid." };
  }

  // Blank fields are stored blank and fall back to the defaults on read, so
  // clearing a field restores the built-in text rather than emptying the page.
  const values = parsed.data;
  if (Object.keys(values).length === 0) return { error: "Nothing to save." };

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    create: { id: "site", ...DEFAULT_SITE_SETTINGS, ...values },
    update: values,
  });

  updateTag(SETTINGS_TAG);
  return { savedAt: Date.now() };
}

const sectionSchema = z.object({
  category: z.nativeEnum(Category),
  tagline: line(120),
  description: line(400),
});

export async function updateSectionSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  if (!(await getAdminUser())) return { error: "Unauthorized" };

  const parsed = sectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Some fields are invalid." };
  }

  const { category, ...values } = parsed.data;

  await prisma.sectionSettings.upsert({
    where: { category },
    create: { category, ...values },
    update: values,
  });

  updateTag(SETTINGS_TAG);
  return { savedAt: Date.now() };
}

export type RoleChangeResult = { error?: string; ok?: boolean };

/**
 * Promote or demote someone.
 *
 * Two guards keep the admin reachable: you can't change your own role (no
 * accidental self-demotion), and the last admin can't be demoted.
 */
export async function setUserRole(userId: unknown, role: unknown): Promise<RoleChangeResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  if (typeof userId !== "string" || (role !== Role.ADMIN && role !== Role.USER)) {
    return { error: "Invalid request." };
  }
  if (userId === admin.id) {
    return { error: "You can't change your own role." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) return { error: "That person no longer exists." };
  if (target.role === role) return { ok: true };

  if (role === Role.USER) {
    const admins = await prisma.user.count({ where: { role: Role.ADMIN } });
    if (admins <= 1) return { error: "There has to be at least one admin." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  return { ok: true };
}
