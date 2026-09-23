import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPreview(content?: string, wordLimit = 20) {
  if (!content) return "No preview available";
  // Remove HTML tags
  // Tags become spaces so adjacent blocks don't run together, then drop the
  // space that leaves before punctuation ("word</b>." -> "word .").
  let text = stripMarkdown(content.replace(/<[^>]*>/g, " "))
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();

  // Decode common HTML entities (covers &nbsp; and numeric entities)
  function decodeHtmlEntities(str: string) {
    if (!str) return str;

    // Named entities map (expand if needed)
    const named: Record<string, string> = {
      nbsp: " ",
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
    };

    // Replace named entities like &nbsp; &amp; etc.
    str = str.replace(/&([a-zA-Z]+);/g, (_m, name) => {
      return name in named ? named[name] : `&${name};`;
    });

    // Replace decimal numeric entities: &#123;
    str = str.replace(/&#(\d+);/g, (_m, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    });

    // Replace hex numeric entities: &#x1f600;
    str = str.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    });

    return str;
  }

  text = decodeHtmlEntities(text);

  // Normalize whitespace: turn all whitespace (including NBSP) into regular spaces and collapse runs
  text = text.replace(/[^\S\u00a0]+/g, " ").replace(/\u00a0/g, " ").replace(/ {2,}/g, " ").trim();

  const words = text ? text.split(/\s+/) : [];

  if (words.length <= wordLimit) return text || "No preview available";

  return words.slice(0, wordLimit).join(" ") + "...";
}

// Rough plain-text version of markdown, good enough for previews and word counts.
export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[^\n]*/g, "") // code fence markers (keep the code)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // headings, quotes, list markers
    .replace(/[*_~`]+/g, ""); // emphasis and inline code markers
}

/** Minutes to read at ~200 wpm; works for both markdown and legacy HTML content. */
export function readingTime(content?: string | null) {
  const text = stripMarkdown((content ?? "").replace(/<[^>]*>/g, " ")).trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`;
}
