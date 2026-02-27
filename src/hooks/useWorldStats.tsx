
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type WorldStats = {
  totalRegions: number;
  totalManagers: number;
  totalTeams: number;
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
        
        // Get all leagues with their region information
        const { data: leaguesData, error: leaguesError } = await supabase
          .from('leagues')
          .select(`
            league_id,
            region_id,
            leagues_regions!inner(
              name
            )
          `);

        if (leaguesError) throw leaguesError;

        if (!leaguesData) {
          throw new Error('No leagues data found');
        }

        // Get total count of all non-bot teams (including waitlist teams)
        const { count: totalTeamsCount, error: totalTeamsError } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('is_bot', 0);

        if (totalTeamsError) throw totalTeamsError;

        // Get total count of managers who have non-bot teams
        const { count: totalManagersCount, error: totalManagersError } = await supabase
          .from('managers')
          .select(`
            username,
            teams!inner(
              is_bot
            )
          `, { count: 'exact', head: true })
          .eq('teams.is_bot', 0);

        if (totalManagersError) throw totalManagersError;

        // Get teams that are assigned to leagues for per-league counts
        const { data: teamsInLeaguesData, error: teamsInLeaguesError } = await supabase
          .from('teams')
          .select(`
            team_id,
            series_members!inner(
              series_id,
              series!inner(
                league_id
              )
            )
          `)
          .eq('is_bot', 0);

        if (teamsInLeaguesError) throw teamsInLeaguesError;

        console.log('Leagues data:', leaguesData);
        console.log('Teams in leagues data:', teamsInLeaguesData);
        console.log('Total teams count:', totalTeamsCount);
        console.log('Total managers count:', totalManagersCount);

        // Create a map to count teams per league
        const leagueTeamCounts = new Map<number, number>();
        
        // Initialize all leagues with 0 count
        leaguesData.forEach(league => {
          leagueTeamCounts.set(league.league_id, 0);
        });

        // Count teams per league (only for teams that are in leagues)
        if (teamsInLeaguesData) {
          teamsInLeaguesData.forEach(team => {
            if (team.series_members && Array.isArray(team.series_members)) {
              team.series_members.forEach(seriesMember => {
                const series = seriesMember.series;
                if (series && series.league_id) {
                  const currentCount = leagueTeamCounts.get(series.league_id) || 0;
                  leagueTeamCounts.set(series.league_id, currentCount + 1);
                }
              });
            }
          });
        }

        // Build leagues array with team counts
        const leagues = leaguesData.map(league => ({
          league_id: league.league_id,
          region_id: league.region_id,
          region_name: league.leagues_regions.name,
          team_count: leagueTeamCounts.get(league.league_id) || 0
        }));

        console.log('Processed leagues with counts:', leagues);

        setStats({
          totalRegions: new Set(leagues.map(l => l.region_id)).size,
          totalManagers: totalManagersCount || 0,
          totalTeams: totalTeamsCount || 0,
          leagues: leagues.sort((a, b) => a.region_name.localeCompare(b.region_name))
        });

      } catch (err) {
        console.error('Error fetching world stats:', err);
        setError(err instanceof Error ? err.message : "Failed to fetch world statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
};
