'use client';

import type { ImageLoaderProps } from "next/image";

const CLOUDINARY_HOST = "res.cloudinary.com";
const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (
    !src.startsWith("https://") ||
    !src.includes(CLOUDINARY_HOST) ||
    !src.includes(CLOUDINARY_UPLOAD_SEGMENT)
  ) {
    return src;
  }

  const [prefix, remainder] = src.split(CLOUDINARY_UPLOAD_SEGMENT);

  if (!remainder) {
    return src;
  }

  const transformations = [
    "f_auto",
    "c_limit",
    `w_${width}`,
    `q_${quality ?? 75}`,
  ].join(",");

  return `${prefix}${CLOUDINARY_UPLOAD_SEGMENT}${transformations}/${remainder.replace(/^\/+/, "")}`;
}
