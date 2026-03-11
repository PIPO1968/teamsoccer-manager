
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { Group } from "./useGroups";

export function useManagerGroups(managerId: string | undefined) {
  return useQuery({
    queryKey: ['manager-groups', managerId],
    queryFn: async () => {
      if (!managerId) return { owned: [], member: [] };
      const data = await apiFetch<{ success: boolean; owned: Group[]; member: Group[] }>(
        `/managers/${parseInt(managerId)}/groups`
      );
      return { owned: data.owned || [], member: data.member || [] };
    },
    enabled: !!managerId
  });
}

