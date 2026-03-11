
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

export type WorldStats = {
  totalRegions: number;
  totalManagers: number;
  totalWaitingManagers: number;
  onlineManagers: number;
  totalTeams: number;
  totalLeagues: number;
  leagues: {
    league_id: number;
    region_id: number;
    region_name: string;
    team_count: number;
  }[];
};

export const useWorldStats = () => {
  const [stats, setStats] = useState<WorldStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch<{ success: boolean; stats: WorldStats }>(
          "/world/stats"
        );
        setStats(response.stats);
      } catch (err) {
        console.error("Error fetching world stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch world statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}

