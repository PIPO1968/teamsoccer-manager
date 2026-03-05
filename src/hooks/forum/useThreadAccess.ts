
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
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
        const data = await apiFetch<{ success: boolean; thread: { forum_category_id?: number } }>(
          `/threads/${Number(threadId)}?page=1&perPage=1`
        );

        // If this is a staff forum (category_id = 4), check if user is admin
        if (data.thread?.forum_category_id === 4) {
          setHasAccess(!!manager && manager.is_admin > 0);
        }
      } catch (error) {
        console.error("Error checking thread access:", error);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkThreadAccess();
  }, [threadId, manager]);

  return { hasAccess, isCheckingAccess };
}
