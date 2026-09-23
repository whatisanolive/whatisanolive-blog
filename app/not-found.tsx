import Link from "next/link";
import type { CSSProperties } from "react";

import { hueVar } from "@/lib/sections";
import { getSectionsWithCopy } from "@/lib/settings";

export default async function NotFound() {
  const sections = await getSectionsWithCopy();

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-32">
      <p className="kicker text-faint">Error 404</p>
      <h1 className="display mt-6 text-4xl text-ink sm:text-5xl">This path does not resolve</h1>
      <p className="mt-5 text-lg leading-relaxed text-subtle">
        There is no post at that address. It may have been renamed, or it may never have existed.
      </p>

      <ul className="mt-12 border-t border-edge">
        {sections.map((section) => (
          <li key={section.key}>
            <Link
              href={section.href}
              style={{ "--brand": hueVar(section.key) } as CSSProperties}
              className="group flex items-baseline justify-between gap-4 border-b border-edge py-5 transition-colors hover:border-brand"
            >
              <span className="display text-xl text-ink transition-colors group-hover:text-brand">
                {section.title}
              </span>
              <span className="truncate text-sm text-faint">{section.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/" className="kicker mt-10 text-faint transition-colors hover:text-brand">
        &larr; Back home
      </Link>
    </div>
  );
}
