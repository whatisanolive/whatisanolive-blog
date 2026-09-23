"use server";

import { markdownToHtml } from "@/lib/markdown";
import { getAdminUser } from "@/lib/require-admin";

export async function previewMarkdown(source: string): Promise<string> {
  if (!(await getAdminUser())) {
    throw new Error("Unauthorized");
  }

  return markdownToHtml(source);
}
