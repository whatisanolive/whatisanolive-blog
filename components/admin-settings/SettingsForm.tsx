"use client";

import { useActionState, type ReactNode } from "react";

import type { SettingsFormState } from "@/actions/settings";
import { cn } from "@/lib/utils";

type Action = (state: SettingsFormState, formData: FormData) => Promise<SettingsFormState>;

/** A settings card: fields, a save button, and inline success/error feedback. */
export function SettingsForm({
  action,
  title,
  description,
  hidden,
  children,
}: {
  action: Action;
  title: string;
  description?: string;
  /** Extra fixed values submitted with the form, e.g. which section this is. */
  hidden?: Record<string, string>;
  children: ReactNode;
}) {
  const [state, formAction, isPending] = useActionState<SettingsFormState, FormData>(action, {});

  return (
    <form action={formAction} className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>

      <div className="space-y-4 p-5">
        {hidden &&
          Object.entries(hidden).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        {children}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t px-5 py-3">
        {state.error && (
          <p className="mr-auto text-xs text-destructive" role="alert">
            {state.error}
          </p>
        )}
        {state.savedAt && !state.error && (
          <p className="mr-auto text-xs text-emerald-600 dark:text-emerald-400" role="status">
            Saved. The site is updated.
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity",
            isPending ? "opacity-60" : "hover:opacity-90",
          )}
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

/** Labelled text input or textarea, with the fallback shown as a hint. */
export function Field({
  label,
  name,
  defaultValue,
  hint,
  rows,
  type = "text",
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
  rows?: number;
  type?: string;
  maxLength?: number;
}) {
  const className =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-medium text-foreground">
        {label}
      </label>
      {rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          maxLength={maxLength}
          className={cn(className, "resize-y leading-relaxed")}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          maxLength={maxLength}
          className={className}
        />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
