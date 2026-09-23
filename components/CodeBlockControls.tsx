"use client";

import { useEffect, useRef } from "react";

/** Shiki's ids are terse; show what a reader would actually call the language. */
const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Bash", c: "C", cpp: "C++", css: "CSS", diff: "Diff", go: "Go", html: "HTML",
  java: "Java", javascript: "JavaScript", js: "JavaScript", json: "JSON", jsx: "JSX",
  md: "Markdown", plaintext: "Text", py: "Python", python: "Python", rs: "Rust",
  rust: "Rust", sh: "Shell", shell: "Shell", sql: "SQL", ts: "TypeScript", tsx: "TSX",
  typescript: "TypeScript", yaml: "YAML", yml: "YAML",
};

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/**
 * Adds a language badge and copy button to every highlighted code block inside
 * the preceding sibling element. Post HTML is rendered on the server as a
 * string, so this decorates it after mount instead of rendering <pre> itself.
 * Pass the HTML as `watch` so the controls are re-added when it changes.
 */
export function CodeBlockControls({ watch }: { watch?: string }) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = markerRef.current?.previousElementSibling;
    if (!container) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    container.querySelectorAll<HTMLElement>("figure[data-rehype-pretty-code-figure]").forEach((figure) => {
      const pre = figure.querySelector("pre");
      if (!pre || figure.querySelector(".code-controls")) return;

      const controls = document.createElement("div");
      controls.className = "code-controls";

      const language = pre.dataset.language;
      if (language) {
        const label = document.createElement("div");
        label.className = "code-controls__label";
        label.textContent = LANGUAGE_LABELS[language] ?? language.toUpperCase();
        controls.append(label);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-controls__copy";
      button.setAttribute("aria-label", "Copy code to clipboard");
      button.innerHTML = COPY_ICON;
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText);
          button.dataset.copied = "";
          button.innerHTML = CHECK_ICON;
          button.setAttribute("aria-label", "Copied to clipboard");
          timers.push(
            setTimeout(() => {
              delete button.dataset.copied;
              button.innerHTML = COPY_ICON;
              button.setAttribute("aria-label", "Copy code to clipboard");
            }, 2000),
          );
        } catch {
          // Clipboard access can be denied; selecting the block is a reasonable consolation.
          const range = document.createRange();
          range.selectNodeContents(pre);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      });
      controls.append(button);

      figure.prepend(controls);
    });

    return () => timers.forEach(clearTimeout);
  }, [watch]);

  return <span ref={markerRef} hidden />;
}
