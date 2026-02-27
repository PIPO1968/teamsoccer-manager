
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useThreadAccess(threadId: string | undefined) {
  const { manager } = useAuth();
  const [hasAccess, setHasAccess] = useState(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    const checkThreadAccess = async () => {
      if (!threadId) return;
      
      setIsCheckingAccess(true);
      
      try {
        // Get the thread to find its forum
        const { data: threadData, error: threadError } = await supabase
          .from('forum_threads')
          .select('forum_id')
          .eq('id', Number(threadId))
          .single();
        
        if (threadError) throw threadError;
        
        // Now get the forum to check its category
        const { data: forumData, error: forumError } = await supabase
          .from('forums')
          .select('category_id')
          .eq('id', threadData.forum_id)
          .single();
        
        if (forumError) throw forumError;
        
        // If this is a staff forum (category_id = 4), check if user is admin
        if (forumData.category_id === 4) {
          setHasAccess(!!manager && manager.is_admin > 0);
        }
        
        setIsCheckingAccess(false);
      } catch (error) {
        console.error("Error checking thread access:", error);
        setIsCheckingAccess(false);
      }
    };
    
    checkThreadAccess();
  }, [threadId, manager]);

  return { hasAccess, isCheckingAccess };
}
