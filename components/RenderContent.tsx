'use client';

import { useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

export default function RenderContent({ content }: { content: string }) {
  useEffect(() => {
    document.querySelectorAll('pre').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);

  return (
    <div
      className="prose prose-invert prose-zinc max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}