"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { hueVar, SECTIONS, SECTION_ORDER } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { SectionIcon } from "./SectionIcon";

function useActiveSection() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks() {
  const isActive = useActiveSection();
  return <DesktopNavList isActive={isActive} />;
}

/** Same links with nothing highlighted: the Suspense fallback while the pathname resolves. */
export function DesktopNavLinksFallback() {
  return <DesktopNavList isActive={() => false} />;
}

function DesktopNavList({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <ul className="hidden items-center gap-1 md:flex">
      {SECTION_ORDER.map((key) => {
        const section = SECTIONS[key];
        const active = isActive(section.href);
        return (
          <li key={key}>
            <Link
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors",
                active
                  ? "bg-brand/12 font-medium text-brand-deep"
                  : "text-subtle hover:bg-ground-alt hover:text-ink",
              )}
            >
              <SectionIcon
                name={section.iconName}
                className="h-4 w-4"
                style={active ? undefined : { color: hueVar(key) }}
              />
              {section.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileNavLinks() {
  return (
    <ul className="space-y-1">
      {SECTION_ORDER.map((key) => {
        const section = SECTIONS[key];
        return (
          <li key={key}>
            <Link
              href={section.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-ground-alt"
            >
              <SectionIcon
                name={section.iconName}
                className="h-4 w-4 shrink-0"
                style={{ color: hueVar(key) }}
              />
              <span className="text-sm font-medium text-ink">{section.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
