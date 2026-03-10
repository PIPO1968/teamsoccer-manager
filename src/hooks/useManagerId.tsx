import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useManagerId = () => {
  const [managerId, setManagerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { manager } = useAuth();

  useEffect(() => {
    // Solo usar el contexto de Auth, sin fallback a localStorage
    if (manager?.user_id) {
      setManagerId(manager.user_id);
    } else {
      setManagerId(null);
    }
    setIsLoading(false);
  }, [manager]);

  return { managerId, isLoading };
};
