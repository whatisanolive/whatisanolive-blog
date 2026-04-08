"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState, useActionState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { editPost } from "@/actions/edit-post";
import Image from "next/image";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import {
  RichTextEditor,
  type ReactQuillInstance,
} from "@/components/posts/rich-text-editor";
import type { EditablePost } from "@/lib/posts";

// Previous Prisma PostWithTags helper kept for reference per request.
// type PostWithTags = Prisma.PostGetPayload<{
//   include: {
//     tags: {
//       include: {
//         tag: true;
//       };
//     };
//   };
// }>;

const EditPostPage = ({ post }: { post: EditablePost }) => {
  // Previous ref kept for reference per request.
  // const quillRef = useRef<any>(null);
  const quillRef = useRef<ReactQuillInstance | null>(null);

  const [content, setContent] = useState(post.content || "");
  const [imageUrl, setImageUrl] = useState(post.featuredImage || "");
  const [uploading, setUploading] = useState(false);

  const updatePostWithId = editPost.bind(null, post.id);

  const [formState, action, isPending] = useActionState(
    updatePostWithId,
    { errors: {} }
  );



  // Previous inline Cloudinary upload function kept for reference per request.
  // const uploadImage = async (file: File) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("upload_preset", "blog_upload");
  //
  //   const res = await fetch(
  //     "https://api.cloudinary.com/v1_1/deoj5kwfb/image/upload",
  //     {
  //       method: "POST",
  //       body: formData,
  //     }
  //   );
  //
  //   const data = await res.json();
  //   return data.secure_url;
  // };
  const uploadImage = useCallback(
    async (file: File) => uploadImageToCloudinary(file),
    [],
  );

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        setUploading(true);
        try {
          const url = await uploadImage(file);
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true) || { index: quill.getLength() };
            quill.insertEmbed(range.index, "image", url);
            quill.setSelection(range.index + 1);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setUploading(false);
        }
      }
    };
  }, [uploadImage]);

  // 🔥 File handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-7">
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={action} className="space-y-6">

            {/* TITLE */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title"
                type="text"
                defaultValue={post.title} />
              {formState.errors.title && (
                <p className="text-red-500 text-sm">
                  {formState.errors.title[0]}
                </p>
              )}
            </div>

            {/* CATEGORY */}
            <div className="space-y-2">
              <Label>Category</Label>
              <select name="category"
                defaultValue={post.category}
                className="w-full border h-10 px-3">
                <option value="TECH">Tech</option>
                <option value="DSA">DSA</option>
                <option value="BLANK_CANVAS">Blank Canvas</option>
              </select>
            </div>

            {/* TAGS */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input name="tags" placeholder="react,nextjs"
                defaultValue={
                  post.tags?.map((t) => t.tag.name).join(", ")
                } />
            </div>

            {/* IMAGE */}
            <div className="space-y-2">
              <Label>Featured Image</Label>

              <Input type="file" onChange={handleFileChange} />

              {uploading && <p>Uploading...</p>}

              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Featured image preview"
                  width={192}
                  height={128}
                  sizes="192px"
                  className="h-32 w-48 rounded-md object-cover"
                />
              )}

              {/* 🔥 IMPORTANT hidden input */}
              <input
                type="hidden"
                name="featuredImage"
                value={imageUrl || ""}
              />

              {formState.errors.featuredImage && (
                <p className="text-red-500 text-sm">
                  {formState.errors.featuredImage[0]}
                </p>
              )}
            </div>

            {/* CONTENT */}
            <div className="space-y-2">
              <Label>Content</Label>

              {/* Previous inline dynamic ReactQuill wrapper kept for reference per request. */}
              {/* <ReactQuill forwardedRef={quillRef} value={content} onChange={setContent} modules={modules} /> */}
              <RichTextEditor
                editorRef={quillRef}
                onImageRequest={imageHandler}
                onChange={setContent}
                value={content}
              />

              <input
                type="hidden"
                name="content"
                value={content ? (content === "<p><br></p>" ? "" : content) : ""}
              />
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={isPending || uploading}
              className={`transition ${uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {uploading
                ? "Uploading image..."
                : isPending
                  ? "Updating..."
                  : "Update Post"}
            </Button>

            {formState.errors.formErrors && (
              <p className="text-red-500">
                {formState.errors.formErrors[0]}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditPostPage
