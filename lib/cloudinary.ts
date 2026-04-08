import { z } from "zod";

const cloudinaryUploadResponseSchema = z.object({
  secure_url: z.string().url(),
});

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "blog_upload");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/deoj5kwfb/image/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  const payload: unknown = await response.json();
  const parsedPayload = cloudinaryUploadResponseSchema.safeParse(payload);

  if (!response.ok || !parsedPayload.success) {
    throw new Error("Cloudinary upload failed.");
  }

  return parsedPayload.data.secure_url;
}
