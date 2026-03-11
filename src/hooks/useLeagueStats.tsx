
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

export type LeagueStats = {
  regionId: number;
  regionName: string;
  totalTeams: number;
  totalManagers: number;
  totalSeries: number;
  seriesList: {
    series_id: number;
    division: number;
    group_number: number;
    team_count: number;
  }[];
};

export const useLeagueStats = (leagueId: string | undefined) => {
  const [stats, setStats] = useState<LeagueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LOG: leagueId recibido
  useEffect(() => {
    console.log('[useLeagueStats] leagueId:', leagueId);
  }, [leagueId]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!leagueId) {
        console.warn('[useLeagueStats] leagueId vacío o undefined');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ success: boolean; stats: LeagueStats }>(`/leagues/${leagueId}`);
        console.log('[useLeagueStats] Respuesta de apiFetch:', data);
        setStats(data.stats);
      } catch (err) {
        console.error('[useLeagueStats] Error en apiFetch:', err);
        setError(err instanceof Error ? err.message : 'Error al obtener datos de la liga');
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [leagueId]);

  return { stats, isLoading, error };
};
