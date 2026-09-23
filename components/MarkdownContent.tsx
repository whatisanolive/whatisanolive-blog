import { CodeBlockControls } from "@/components/CodeBlockControls";
import { cn } from "@/lib/utils";

// Renders HTML produced by lib/markdown (already sanitized and highlighted on the server).
export default function MarkdownContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <>
      <div
        className={cn("prose prose-blog w-full min-w-0", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CodeBlockControls watch={html} />
    </>
  );
}
