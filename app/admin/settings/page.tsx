import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { updateSectionSettings, updateSiteSettings } from "@/actions/settings";
import { Field, SettingsForm } from "@/components/admin-settings/SettingsForm";
import { UserRoleSelect } from "@/components/admin-settings/UserRoleSelect";
import { getAdminUsers } from "@/lib/admin-users";
import { getAdminUser } from "@/lib/require-admin";
import { SECTIONS, SECTION_ORDER } from "@/lib/sections";
import { getSectionCopy, getSiteSettings } from "@/lib/settings";
import { formatDate, pluralize } from "@/lib/utils";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/");

  return (
    <main className="flex-1 p-4 md:p-8">
      <header className="mb-6">
        <p className="kicker text-faint">Admin</p>
        <h1 className="display mt-2 text-3xl text-ink">Settings</h1>
        <p className="mt-2 text-sm text-subtle">
          Site details, homepage wording, section copy and who can sign in as an admin.
          Leave a field blank to fall back to the built-in text.
        </p>
      </header>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" />}>
        <SettingsContent adminId={admin.id} />
      </Suspense>
    </main>
  );
}

async function SettingsContent({ adminId }: { adminId: string }) {
  const [settings, sectionCopy, users] = await Promise.all([
    getSiteSettings(),
    getSectionCopy(),
    getAdminUsers(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <SettingsForm
        action={updateSiteSettings}
        title="Site"
        description="Used in the navbar, the footer, the browser tab and link previews."
      >
        <Field
          label="Site name"
          name="siteName"
          defaultValue={settings.siteName}
          maxLength={60}
          hint="Shown in the navbar and footer."
        />
        <Field
          label="Tagline"
          name="tagline"
          defaultValue={settings.tagline}
          maxLength={120}
          hint="Appears after the site name in the browser tab."
        />
        <Field
          label="Description"
          name="description"
          defaultValue={settings.description}
          rows={2}
          maxLength={300}
          hint="Used by search engines and link previews."
        />
        <Field
          label="Contact email"
          name="email"
          type="email"
          defaultValue={settings.email}
          hint="The mail link in the footer."
        />
        <Field
          label="GitHub URL"
          name="github"
          type="url"
          defaultValue={settings.github}
          hint="The GitHub link in the footer."
        />
        <Field
          label="Footer text"
          name="footerBlurb"
          defaultValue={settings.footerBlurb}
          rows={2}
          maxLength={300}
        />
      </SettingsForm>

      <SettingsForm
        action={updateSiteSettings}
        title="Homepage"
        description="The big heading and the paragraph under it."
      >
        <Field
          label="Heading"
          name="heroLead"
          defaultValue={settings.heroLead}
          rows={2}
          maxLength={200}
          hint="The highlighted word below is added to the end of this."
        />
        <Field
          label="Highlighted word"
          name="heroHighlight"
          defaultValue={settings.heroHighlight}
          maxLength={40}
          hint="Shown in the blue-green-violet gradient, followed by a full stop."
        />
        <Field
          label="Intro paragraph"
          name="heroIntro"
          defaultValue={settings.heroIntro}
          rows={4}
          maxLength={600}
        />
      </SettingsForm>

      {SECTION_ORDER.map((key) => {
        const section = SECTIONS[key];
        const copy = sectionCopy[section.category];

        return (
          <SettingsForm
            key={key}
            action={updateSectionSettings}
            hidden={{ category: section.category }}
            title={`${section.title} section`}
            description="Shown on the homepage card and at the top of the section page."
          >
            <Field
              label="Tagline"
              name="tagline"
              defaultValue={copy.tagline}
              maxLength={120}
            />
            <Field
              label="Description"
              name="description"
              defaultValue={copy.description}
              rows={3}
              maxLength={400}
            />
          </SettingsForm>
        );
      })}

      <section className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-medium text-foreground">People</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Everyone who has signed in. Admins can write posts and moderate comments.
            You can&apos;t change your own role, and the last admin can&apos;t be demoted.
          </p>
        </div>

        <ul className="divide-y">
          {users.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-xs text-muted-foreground"
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email} · joined {formatDate(user.createdAt)} ·{" "}
                  {pluralize(user.posts, "post")} · {pluralize(user.comments, "comment")}
                </p>
              </div>

              <UserRoleSelect user={user} isSelf={user.id === adminId} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
