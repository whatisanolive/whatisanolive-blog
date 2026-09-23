"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setUserRole } from "@/actions/settings";
import type { AdminUser } from "@/lib/admin-users";

/** Role dropdown. Your own row is locked, so you can't demote yourself. */
export function UserRoleSelect({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return (
      <span className="text-xs text-muted-foreground" title="You can't change your own role">
        Admin (you)
      </span>
    );
  }

  const change = (next: "ADMIN" | "USER") => {
    const previous = role;
    setRole(next);
    setError(null);
    startTransition(async () => {
      const result = await setUserRole(user.id, next);
      if (result.error) {
        setRole(previous);
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
      <select
        value={role}
        disabled={isPending}
        onChange={(e) => change(e.target.value as "ADMIN" | "USER")}
        aria-label={`Role for ${user.name}`}
        className="h-8 rounded-full border bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
      >
        <option value="USER">Reader</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>
  );
}
