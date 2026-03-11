
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";

interface ManagerProfile {
  user_id: number;
  username: string;
  email: string;
  country_id: number;
  is_admin: number;
  is_premium?: number;
  premium_expires_at?: string;
  status?: string;
  created_at: string;
  country_name?: string;
  teams?: {
    name: string;
    team_id: number;
    created_at: string;
    is_bot: number;
    club_logo?: string;
  }[];
}

export const useManagerProfile = (managerId: number | null) => {
  return useQuery({
    queryKey: ['manager-profile', managerId],
    queryFn: async (): Promise<ManagerProfile | null> => {
      if (!managerId) return null;
      const data = await apiFetch<{ success: boolean; manager: ManagerProfile }>(
        `/managers/${managerId}/profile`
      );
      return data.manager;
    },
    enabled: !!managerId,
  });
};
