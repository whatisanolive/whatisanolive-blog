import Link from "next/link";
import { Menu } from "lucide-react";
import { Suspense } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getSiteSettings } from "@/lib/settings";
import { DesktopNavLinks, DesktopNavLinksFallback, MobileNavLinks } from "./NavLinks";
import { AuthControls } from "./AuthControls";
import { ThemeToggle } from "./ThemeToggle";

export default async function Navbar() {
  const { siteName } = await getSiteSettings();

  return (
    <header className="sticky top-0 z-50 border-b border-edge-soft bg-ground/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="display text-xl text-ink">
          {siteName}
        </Link>

        <div className="flex items-center gap-2">
          <Suspense fallback={<DesktopNavLinksFallback />}>
            <DesktopNavLinks />
          </Suspense>

          <ThemeToggle />

          <Suspense fallback={<div className="h-9 w-9" />}>
            <AuthControls />
          </Suspense>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-edge text-subtle transition-colors hover:text-ink md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-edge bg-ground p-6">
              <SheetHeader className="mb-4 p-0 text-left">
                <SheetTitle className="display text-xl text-ink">{siteName}</SheetTitle>
                <SheetDescription className="kicker text-faint">Sections</SheetDescription>
              </SheetHeader>
              <SheetClose asChild>
                <div>
                  <MobileNavLinks />
                </div>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
