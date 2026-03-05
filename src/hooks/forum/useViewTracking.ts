
import { useState } from "react";

export function useViewTracking(threadId: number | undefined, viewCount: number | undefined) {
  // View tracking is handled automatically by the backend when fetching thread data
  const [viewTracked] = useState(true);

  const trackView = async () => {
    // No-op: the backend increments view_count on GET /threads/:id
  };

  return { viewTracked, trackView };
}
