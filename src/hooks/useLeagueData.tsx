
import { useState, useEffect } from "react";

export type League = {
  series_id: number;
  league_id: number;
  league_name: string;
  division: number;
  group_number: number;
  region_id: number; // Added region_id to the League type
  region_name: string;
  season: number;
  teams: {
    team_id: number;
    team_name: string;
    team_logo: string | null;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
    form: string[];
    is_bot: number;
  }[];
};

export const useLeagueData = (seriesId: string | undefined) => {
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagueData = async () => {
      if (!seriesId) {
        setLeague(null);
        setIsLoading(false);
        return;
      }
      const parsedSeriesId = parseInt(seriesId, 10);
      if (isNaN(parsedSeriesId)) {
        setError("ID de serie inválido");
        setLeague(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Llama a la API Express para obtener datos de la liga/serie
        const response = await fetch(`/api/series/${parsedSeriesId}`);
        if (!response.ok) throw new Error("No se pudo obtener datos de la serie");
        const data = await response.json();
        setLeague(data.league || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener datos de la liga");
        setLeague(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeagueData();
  }, [seriesId]);

  return { league, isLoading, error };
};
