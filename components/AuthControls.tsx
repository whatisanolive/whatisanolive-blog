"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";

/**
 * A client component on purpose: <SignInButton> checks its child with
 * React.Children.only, and a child element sent from a server component can
 * arrive as a lazy reference, which that check rejects ("You've passed
 * multiple children components"). Creating the button here avoids that.
 */
export function AuthControls() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton>
          <button
            type="button"
            className="flex h-9 items-center justify-center rounded-full border border-edge px-4 text-sm text-subtle transition-colors hover:border-brand hover:text-brand"
          >
            Sign in
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
      </Show>
    </>
  );
}
