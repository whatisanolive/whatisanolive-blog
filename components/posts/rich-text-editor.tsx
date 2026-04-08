"use client";

import dynamic from "next/dynamic";
import { useMemo, type ComponentPropsWithoutRef, type Ref } from "react";
import hljs from "highlight.js";
import "react-quill-new/dist/quill.snow.css";
import "highlight.js/styles/github.css";
import type ReactQuillType from "react-quill-new";

declare global {
  interface Window {
    hljs?: typeof hljs;
  }
}

if (typeof window !== "undefined") {
  window.hljs = hljs;
}

type ReactQuillInstance = InstanceType<typeof ReactQuillType>;
type ReactQuillProps = ComponentPropsWithoutRef<typeof ReactQuillType>;
type DynamicReactQuillProps = ReactQuillProps & {
  forwardedRef?: Ref<ReactQuillInstance>;
};

const ReactQuill = dynamic(
  async () => {
    const { default: QuillEditor } = await import("react-quill-new");

    const DynamicReactQuill = ({
      forwardedRef,
      ...props
    }: DynamicReactQuillProps) => (
      <QuillEditor ref={forwardedRef} {...props} />
    );

    DynamicReactQuill.displayName = "DynamicReactQuill";

    return DynamicReactQuill;
  },
  {
    ssr: false,
  },
);

type RichTextEditorProps = {
  editorRef: Ref<ReactQuillInstance>;
  onImageRequest: () => void;
  onChange: (value: string) => void;
  value: string;
};

export function RichTextEditor({
  editorRef,
  onImageRequest,
  onChange,
  value,
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: onImageRequest,
        },
      },
      syntax: true,
    }),
    [onImageRequest],
  );

  return (
    <ReactQuill
      forwardedRef={editorRef}
      modules={modules}
      onChange={onChange}
      theme="snow"
      value={value}
    />
  );
}

export type { ReactQuillInstance };
