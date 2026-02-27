
import { useState, useEffect } from "react";

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

  useEffect(() => {
    const fetchStats = async () => {
      if (!leagueId) return;
      setStats(null);
      setError(null);
      setIsLoading(false);
    };

    fetchStats();
  }, [leagueId]);

  return { stats, isLoading, error };
};
