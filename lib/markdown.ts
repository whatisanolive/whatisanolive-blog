import "server-only";

import { cacheLife } from "next/cache";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import TurndownService from "turndown";
import { unified } from "unified";

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // Raw HTML inside markdown is dropped, and sanitize strips unsafe URLs/attributes
  // before syntax highlighting adds its own (trusted) markup.
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypePrettyCode, {
    // Both themes are emitted as --shiki-light / --shiki-dark on every token;
    // globals.css picks one based on the theme toggle.
    theme: { light: "vitesse-light", dark: "vitesse-dark" },
    keepBackground: false,
    // Only fenced blocks; inline `code` stays plain and is styled by .prose-blog.
    defaultLang: { block: "plaintext" },
  })
  .use(rehypeStringify);

export async function markdownToHtml(source: string): Promise<string> {
  const file = await markdownProcessor.process(source);
  return String(file);
}

export async function renderMarkdown(source: string): Promise<string> {
  "use cache";

  cacheLife("max");

  return markdownToHtml(source);
}

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Quill stores code blocks as <pre class="ql-syntax">…</pre> without a <code> child.
turndown.addRule("quillCodeBlock", {
  filter: (node) => node.nodeName === "PRE",
  replacement: (_content, node) =>
    `\n\n\`\`\`\n${(node.textContent ?? "").replace(/\n$/, "")}\n\`\`\`\n\n`,
});

export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html);
}
