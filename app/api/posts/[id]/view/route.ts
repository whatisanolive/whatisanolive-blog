import { NextResponse } from "next/server";

import { dayKeyToDate, toDayKey } from "@/lib/activity";
import { prisma } from "@/lib/prisma";

const DAY_IN_SECONDS = 60 * 60 * 24;

/**
 * Counts one view of a published post.
 *
 * A route handler rather than a server action: setting a cookie in a server
 * action makes Next re-render the page, which a view counter doesn't need.
 * The cookie means one browser counts at most once per post per day, so
 * refreshing doesn't inflate the number. Called from the browser, so most
 * bots (which don't run JavaScript) are never counted.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieName = `pv_${id}`;

  if (!/^[a-z0-9]{1,40}$/i.test(id)) {
    return new NextResponse(null, { status: 400 });
  }

  const alreadyCounted = request.headers
    .get("cookie")
    ?.split(";")
    .some((part) => part.trim().startsWith(`${cookieName}=`));

  if (alreadyCounted) {
    return new NextResponse(null, { status: 204 });
  }

  const count = await prisma.$transaction(async (tx) => {
    const { count } = await tx.post.updateMany({
      where: { id, status: "PUBLISHED" },
      data: { views: { increment: 1 } },
    });
    if (count === 0) return 0;

    // Today's row in the daily history (for the analytics charts).
    const day = dayKeyToDate(toDayKey(new Date()));
    await tx.postViewDaily.upsert({
      where: { postId_day: { postId: id, day } },
      create: { postId: id, day, count: 1 },
      update: { count: { increment: 1 } },
    });
    return count;
  });

  const response = new NextResponse(null, { status: count > 0 ? 204 : 404 });
  if (count > 0) {
    response.cookies.set(cookieName, "1", {
      maxAge: DAY_IN_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return response;
}
