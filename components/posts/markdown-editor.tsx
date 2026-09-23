"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Code, Heading2, ImagePlus, Bold, LayoutTemplate, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarkdownContent from "@/components/MarkdownContent";
import { previewMarkdown } from "@/actions/preview-markdown";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import type { PostTemplate } from "@/lib/post-templates";
import { cn } from "@/lib/utils";

type Mode = "write" | "split" | "preview";

type MarkdownEditorProps = {
  name: string;
  defaultValue?: string;
  onUploadingChange?: (uploading: boolean) => void;
  /** When given, the editor offers these as starting points. */
  templates?: PostTemplate[];
  onTemplateApplied?: (template: PostTemplate) => void;
};

/** `_italic prompts_` in the templates, used to spot ones left unfilled. */
function templatePrompts(templates: PostTemplate[]) {
  const prompts = new Set<string>();
  for (const template of templates) {
    for (const match of template.content.matchAll(/_[^_\n]{6,}_/g)) {
      prompts.add(match[0]);
    }
  }
  return [...prompts];
}

export function MarkdownEditor({
  name,
  defaultValue = "",
  onUploadingChange,
  templates,
  onTemplateApplied,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<Mode>("split");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [showTemplates, setShowTemplates] = useState(false);

  const showPreview = mode !== "write";
  const isEmpty = value.trim() === "";

  const prompts = useMemo(() => (templates ? templatePrompts(templates) : []), [templates]);
  const unfilledPrompts = prompts.filter((prompt) => value.includes(prompt)).length;

  const applyTemplate = (template: PostTemplate) => {
    if (
      !isEmpty &&
      !window.confirm(`Replace what you've written with the "${template.label}" template?`)
    ) {
      return;
    }
    setValue(template.content);
    setShowTemplates(false);
    if (mode === "preview") setMode("split");
    onTemplateApplied?.(template);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      el?.focus();
      el?.setSelectionRange(0, 0);
      el?.scrollTo({ top: 0 });
    });
  };

  // Render the preview on the server with the same pipeline as the live post,
  // debounced so we don't send a request on every keystroke.
  useEffect(() => {
    if (!showPreview) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const html = await previewMarkdown(value);
        if (!cancelled) {
          setPreviewHtml(html);
          setPreviewError(null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setPreviewError("Preview failed to render.");
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [value, showPreview]);

  const replaceSelection = (
    build: (selected: string) => string,
    placeholder = "",
  ) => {
    const el = textareaRef.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end) || placeholder;
    const inserted = build(selected);
    setValue(value.slice(0, start) + inserted + value.slice(end));

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + inserted.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const insertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      onUploadingChange?.(true);
      try {
        const url = await uploadImageToCloudinary(file);
        replaceSelection((alt) => `![${alt}](${url})`, file.name.replace(/\.[^.]+$/, ""));
      } catch (err) {
        console.error(err);
      } finally {
        onUploadingChange?.(false);
      }
    };
    input.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab indents instead of leaving the textarea — handy when writing code.
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      replaceSelection(() => "  ");
    }
  };

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
        <div className={cn("flex items-center gap-1", mode === "preview" && "invisible")}>
          <ToolbarButton label="Heading" onClick={() => replaceSelection((t) => `## ${t}`, "Heading")}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Bold" onClick={() => replaceSelection((t) => `**${t}**`, "bold text")}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Link" onClick={() => replaceSelection((t) => `[${t}](https://)`, "link text")}>
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            onClick={() => replaceSelection((t) => `\n\`\`\`ts\n${t}\n\`\`\`\n`, "// code")}
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Upload image" onClick={insertImage}>
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>
          {templates && templates.length > 0 && (
            <ToolbarButton label="Templates" onClick={() => setShowTemplates((open) => !open)}>
              <LayoutTemplate className="h-4 w-4" />
            </ToolbarButton>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-md bg-muted p-1 text-xs">
          {(["write", "split", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-2.5 py-1 capitalize transition-colors",
                mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {templates && templates.length > 0 && (showTemplates || isEmpty) && (
        <div className="border-b bg-muted/40 p-3">
          <p className="mb-2 text-xs text-muted-foreground">
            {isEmpty ? "Start from a template, or just start typing:" : "Replace the content with a template:"}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                className="rounded-lg border bg-background p-3 text-left transition-colors hover:border-ring"
              >
                <span className="block text-sm font-medium text-foreground">{template.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{template.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn("grid", mode === "split" && "lg:grid-cols-2")}>
        {mode !== "preview" && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck
            placeholder={"# Hello world\n\nWrite in **Markdown**. Code blocks get syntax highlighting:\n\n```ts\nconst answer = 42;\n```"}
            className="min-h-[560px] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
        )}

        {showPreview && (
          <div
            className={cn(
              "min-h-[560px] overflow-auto p-4",
              mode === "split" && "border-t lg:border-t-0 lg:border-l",
            )}
          >
            {previewError ? (
              <p className="text-sm text-red-500">{previewError}</p>
            ) : value.trim() ? (
              <MarkdownContent html={previewHtml} />
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      {unfilledPrompts > 0 && (
        <p className="border-t px-4 py-2 text-xs text-amber-600 dark:text-amber-400">
          {unfilledPrompts === 1 ? "1 template prompt" : `${unfilledPrompts} template prompts`} still to
          fill in or delete (the _italic_ placeholder text).
        </p>
      )}

      <input type="hidden" name={name} value={value} />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button type="button" variant="ghost" size="icon" title={label} aria-label={label} onClick={onClick}>
      {children}
    </Button>
  );
}
