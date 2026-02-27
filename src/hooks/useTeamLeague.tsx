
import { useState, useEffect } from "react";

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
        // Llama a la API Express para obtener datos de liga del equipo
        const response = await fetch(`/api/teams/${teamId}/league`);
        if (!response.ok) throw new Error("No se pudo obtener datos de liga del equipo");
        const data = await response.json();
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
