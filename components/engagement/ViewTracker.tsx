"use client";

import { useEffect, useRef } from "react";

/** Records one view of the post after it mounts in the browser. Renders nothing. */
export function ViewTracker({ postId }: { postId: string }) {
  // Effects run twice in development (Strict Mode); count once per page load.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    fetch(`/api/posts/${postId}/view`, { method: "POST", keepalive: true }).catch(() => {
      // A missed view isn't worth surfacing to the reader.
    });
  }, [postId]);

  return null;
}
