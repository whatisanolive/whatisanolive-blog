import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { PostCard } from "@/components/PostCard";
import { SectionIcon } from "@/components/SectionIcon";
import { getHomePageData } from "@/lib/posts";
import { hueVar, type Section } from "@/lib/sections";
import { getSectionsWithCopy, getSiteSettings } from "@/lib/settings";
import { pluralize } from "@/lib/utils";

export default async function Home() {
  const [{ counts, recent, activity, activityStats }, settings, sections] = await Promise.all([
    getHomePageData(),
    getSiteSettings(),
    getSectionsWithCopy(),
  ]);
  const totalPosts = counts.TECH + counts.DSA + counts.BLANK_CANVAS;

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] grid-backdrop" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ------------------------------ Hero ------------------------------ */}
        <section className="py-24 sm:py-32">
          <p className="kicker text-faint">
            {pluralize(totalPosts, "essay")} &middot; three sections
          </p>

          <h1 className="display mt-8 max-w-4xl text-balance-pretty text-5xl text-ink sm:text-7xl">
            {settings.heroLead}{" "}
            <em className="bg-gradient-to-r from-[var(--hue-tech)] via-[var(--hue-dsa)] to-[var(--hue-blank-canvas)] bg-clip-text not-italic text-transparent">
              {settings.heroHighlight}
            </em>
            .
          </h1>

          <div className="mt-10 flex max-w-2xl gap-6">
            <span aria-hidden className="mt-3 h-px w-12 shrink-0 bg-edge" />
            <p className="text-lg leading-relaxed text-subtle">{settings.heroIntro}</p>
          </div>
        </section>

        {/* -------------------------- Three pillars ------------------------- */}
        <section aria-labelledby="pillars-heading" className="pb-24">
          <h2 id="pillars-heading" className="sr-only">
            Sections
          </h2>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-edge bg-edge md:grid-cols-3">
            {sections.map((section) => (
              <PillarCard key={section.key} section={section} count={counts[section.category]} />
            ))}
          </div>
        </section>

        {/* ---------------------------- Consistency ------------------------- */}
        <section className="pb-24">
          <ActivityHeatmap data={activity} stats={activityStats} />
        </section>

        {/* ------------------------------ Recent ---------------------------- */}
        {recent.length > 0 && (
          <section aria-labelledby="recent-heading" className="pb-10">
            <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-edge pb-4">
              <h2 id="recent-heading" className="display text-2xl text-ink">
                Recently published
              </h2>
              <span className="kicker text-faint">latest {recent.length}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {recent.map((post) => (
                <PostCard key={post.id} post={post} showSection />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PillarCard({ section, count }: { section: Section; count: number }) {
  return (
    <Link
      href={section.href}
      // The section's hue becomes this card's brand colour, so one card can
      // preview a section's colour without leaving the homepage palette.
      style={{ "--brand": hueVar(section.key) } as CSSProperties}
      className="group relative flex flex-col bg-ground p-8 transition-colors hover:bg-ground-alt"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <SectionIcon name={section.iconName} className="h-5 w-5 text-brand" />

      <h3 className="display mt-6 text-2xl text-ink">{section.title}</h3>
      <p className="mt-2 text-sm text-brand">{section.tagline}</p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-subtle">{section.description}</p>

      <span className="kicker mt-8 flex items-center justify-between text-faint">
        {pluralize(count, "post")}
        <ArrowRight
          className="h-4 w-4 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand"
          aria-hidden
        />
      </span>
    </Link>
  );
}
