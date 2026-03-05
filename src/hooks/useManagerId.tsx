import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useManagerId = () => {
  const [managerId, setManagerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { manager } = useAuth();

  useEffect(() => {
    const fetchManagerId = async () => {
      // If we have the manager from auth context, use that ID
      if (manager?.user_id) {
        setManagerId(manager.user_id);
        setIsLoading(false);
        return;
      }

      // Otherwise try to fetch from localStorage as a fallback
      const storedManager = localStorage.getItem('manager');
      if (storedManager) {
        try {
          const parsedManager = JSON.parse(storedManager);
          if (parsedManager?.user_id) {
            setManagerId(parsedManager.user_id);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing stored manager data:", error);
        }
      }

      setIsLoading(false);
    };

    fetchManagerId();
  }, [manager]);

  return { managerId, isLoading };
};
