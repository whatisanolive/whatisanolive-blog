import Link from "next/link";
import { Button } from "./ui/button";
import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import { Menu } from "lucide-react";
import { Suspense } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const navLinks = [
    { href: "/tech", label: "Tech" },
    { href: "/dsa", label: "DSA" },
    { href: "/blank-canvas", label: "Blank Canvas" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary/10 backdrop-blur supports-[backdrop-filter]:bg-background/20 border-b-4 border-chart-1/70">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-chart-1 font-bold text-lg tracking-tighter">
              whatisanolive
            </Link>
          </div>

          {/* DESKTOP LINKS (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-foreground transition-colors hover:text-chart-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* RIGHT SECTION: AUTH & MOBILE TRIGGER */}
          <div className="flex items-center gap-2">

            {/* Desktop Auth (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2">
              <Suspense fallback={<DesktopAuthFallback />}>
                <DesktopAuthControls />
              </Suspense>
            </div>

            {/* MOBILE NAVIGATION (Sheet) */}
            <div className="md:hidden flex items-center gap-2">
              {/* Keep UserButton visible on mobile too */}
              <Suspense fallback={null}>
                <MobileAuthControls />
              </Suspense>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-zinc-950 border-zinc-800 text-white p-6">
                  <SheetHeader className="text-left mb-8">
                    <SheetTitle className="text-blue-100">Menu</SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-foreground hover:text-chart-1 transition-colors border-b border-white/5 pb-2"
                      >
                        {link.label}
                      </Link>
                    ))}

                    <div className="pt-4">
                      <Suspense fallback={<Button className="w-full">Sign in</Button>}>
                        <MobileSheetAuthControls />
                      </Suspense>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}

function DesktopAuthControls() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton><Button>Sign in</Button></SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton appearance={{
          elements: {
            avatarBox: "border border-white",
          },
        }} />
      </Show>
    </>
  );
}

function DesktopAuthFallback() {
  return <Button disabled>Account</Button>;
}

function MobileAuthControls() {
  return (
    <Show when="signed-in">
      <UserButton appearance={{
        elements: {
          avatarBox: "border border-white w-8 h-8",
        },
      }} />
    </Show>
  );
}

function MobileSheetAuthControls() {
  return (
    <Show when="signed-out">
      <SignInButton>
        <Button className="w-full">Sign in</Button>
      </SignInButton>
    </Show>
  );
}
