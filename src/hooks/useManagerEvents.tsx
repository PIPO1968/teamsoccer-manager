
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";

interface ManagerEvent {
  event_type: string;
  event_description: string;
  created_at: string;
}

export const useManagerEvents = (managerId: string | undefined) => {
  return useQuery({
    queryKey: ['manager-events', managerId],
    queryFn: async (): Promise<ManagerEvent[]> => {
      if (!managerId) return [];
      const data = await apiFetch<{ success: boolean; events: ManagerEvent[] }>(
        `/managers/${parseInt(managerId)}/events`
      );
      return data.events || [];
    },
    enabled: !!managerId,
  });
};
