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
      className="prose prose-blog w-full min-w-0"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}