import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPreview(content?: string, wordLimit = 20) {
  if (!content) return "No preview available";

  const text = content.replace(/<[^>]*>/g, "").trim();

  const words = text.split(/\s+/);

  if (words.length <= wordLimit) return text;

  return words.slice(0, wordLimit).join(" ") + "...";
}