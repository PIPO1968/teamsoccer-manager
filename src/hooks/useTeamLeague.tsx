
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

export type TeamLeague = {
  series_id: number;
  league_id: number;
  division: number;
  group_number: number;
  region_name: string;
};

export const useTeamLeague = (teamId: string | undefined) => {
  const [league, setLeague] = useState<TeamLeague | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamLeague = async () => {
      if (!teamId) {
        setLeague(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ success: boolean; league: TeamLeague | null }>(
          `/teams/${teamId}/league`
        );
        setLeague(data.league || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener datos de liga del equipo");
        setLeague(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamLeague();
  }, [teamId]);

  return { league, isLoading, error };
};
