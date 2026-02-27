
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useViewTracking(threadId: number | undefined, viewCount: number | undefined) {
  const [viewTracked, setViewTracked] = useState(false);

  const trackView = async () => {
    if (!threadId || viewTracked) return;
    
    try {
      await supabase
        .from('forum_threads')
        .update({ view_count: viewCount ? viewCount + 1 : 1 })
        .eq('id', threadId);
      
      setViewTracked(true);
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  return { viewTracked, trackView };
}
