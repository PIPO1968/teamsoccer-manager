
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/apiClient";
import { format } from "date-fns";

interface ManagerStatus {
  is_online: boolean;
  last_seen: string | null;
}

export const useManagerStatus = (managerId: number | undefined) => {
  const [status, setStatus] = useState<ManagerStatus>({
    is_online: false,
    last_seen: null
  });

  useEffect(() => {
    if (!managerId) {
      setStatus({ is_online: false, last_seen: null });
      return;
    }

    const fetchStatus = async () => {
      try {
        const data = await apiFetch<{ success: boolean; is_online: boolean; last_seen: string | null }>(
          `/managers/${managerId}/status`
        );
        setStatus({
          is_online: data.is_online,
          last_seen: data.last_seen ? format(new Date(data.last_seen), 'PPpp') : null
        });
      } catch {
        setStatus({ is_online: false, last_seen: null });
      }
    };

    fetchStatus();
  }, [managerId]);

  return status;
};
