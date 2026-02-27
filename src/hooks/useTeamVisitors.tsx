
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      
      await supabase.rpc('record_team_visit', {
        p_team_id: parseInt(teamId),
        p_visitor_id: manager.user_id
      });
    };

    recordVisit();
  }, [teamId, manager]);

  return useQuery({
    queryKey: ['team-visitors', teamId],
    queryFn: async (): Promise<TeamVisitor[]> => {
      if (!teamId) return [];
      
      const { data, error } = await supabase.rpc('get_team_recent_visitors', {
        p_team_id: parseInt(teamId)
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!teamId
  });
};
