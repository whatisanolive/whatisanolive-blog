-- Daily view history per post, for the analytics dashboard. Post.views stays the all-time total.
-- CreateTable
CREATE TABLE "PostViewDaily" (
    "postId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostViewDaily_pkey" PRIMARY KEY ("postId","day")
);

-- CreateIndex
CREATE INDEX "PostViewDaily_day_idx" ON "PostViewDaily"("day");

-- AddForeignKey
ALTER TABLE "PostViewDaily" ADD CONSTRAINT "PostViewDaily_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

