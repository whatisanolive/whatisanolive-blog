-- CreateEnum
CREATE TYPE "ContentFormat" AS ENUM ('HTML', 'MARKDOWN');

-- Existing posts were written with the Quill editor, so backfill them as HTML.
ALTER TABLE "Post" ADD COLUMN "contentFormat" "ContentFormat" NOT NULL DEFAULT 'HTML';

-- New posts are written in Markdown.
ALTER TABLE "Post" ALTER COLUMN "contentFormat" SET DEFAULT 'MARKDOWN';
