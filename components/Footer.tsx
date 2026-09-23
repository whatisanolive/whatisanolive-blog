import { Mail } from "lucide-react";
import Link from "next/link";
import type { SVGProps } from "react";

import { SECTIONS, SECTION_ORDER } from "@/lib/sections";
import { getSiteSettings } from "@/lib/settings";

/* lucide-react v1 dropped brand marks, so this one is inlined. */
function GithubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.02c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export default async function Footer() {
  const { siteName, footerBlurb, email, github } = await getSiteSettings();

  const socials = [
    ...(github ? [{ href: github, label: "GitHub", icon: GithubMark }] : []),
    ...(email ? [{ href: `mailto:${email}`, label: "Email", icon: Mail }] : []),
  ];

  return (
    <footer className="mt-28 border-t border-edge-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 sm:flex-row sm:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="display text-2xl text-ink">{siteName}</p>
          <p className="text-sm leading-relaxed text-subtle">{footerBlurb}</p>
        </div>

        <div className="flex flex-col gap-6 sm:items-end">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {SECTION_ORDER.map((key) => (
              <li key={key}>
                <Link
                  href={SECTIONS[key].href}
                  className="text-sm text-subtle transition-colors hover:text-brand-deep"
                >
                  {SECTIONS[key].title}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="flex gap-2">
            {socials.map(({ href, label, icon: Icon }) => {
              // A mailto: opens the mail client, so target="_blank" would strand an empty tab.
              const external = href.startsWith("http");
              return (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={external ? `${label} (opens in a new tab)` : label}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-edge text-subtle transition-colors hover:border-brand hover:text-brand"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-edge-soft">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs text-faint">
          Made with love. -w
        </p>
      </div>
    </footer>
  );
}
