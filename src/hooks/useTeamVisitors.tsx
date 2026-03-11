
import { useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface TeamVisitor {
  visitor_id: number;
  visitor_username: string;
  visited_at: string;
}

export const useTeamVisitors = (teamId: string | undefined) => {
  const { manager } = useAuth();

  useEffect(() => {
    const recordVisit = async () => {
      if (!teamId || !manager?.user_id) return;
      try {
        await apiFetch(`/teams/${parseInt(teamId)}/visit`, {
          method: 'POST',
          body: JSON.stringify({ visitorId: manager.user_id }),
        });
      } catch {
        // No crítico
      }
    };

    recordVisit();
  }, [teamId, manager]);

  return useQuery({
    queryKey: ['team-visitors', teamId],
    queryFn: async (): Promise<TeamVisitor[]> => {
      if (!teamId) return [];
      const data = await apiFetch<{ success: boolean; visitors: TeamVisitor[] }>(
        `/teams/${parseInt(teamId)}/visitors`
      );
      return data.visitors || [];
    },
    enabled: !!teamId
  });
};
