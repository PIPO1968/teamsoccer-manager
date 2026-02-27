
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCountryNameById } from "@/utils/countries";

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
      
      try {
        setIsLoading(true);
        
        // Parse the leagueId to a number since Supabase expects a number
        const leagueIdNum = parseInt(leagueId, 10);
        
        if (isNaN(leagueIdNum)) {
          throw new Error("Invalid league ID");
        }
        
        // Get league region name
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select(`
            league_id,
            region_id,
            leagues_regions!inner (
              region_id,
              name
            )
          `)
          .eq('league_id', leagueIdNum)
          .single();

        if (leagueError) throw leagueError;

        // Get series data for this league
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*')
          .eq('league_id', leagueIdNum)
          .order('division', { ascending: false });

        if (seriesError) throw seriesError;

        // Get all teams in this league across all series
        const seriesIds = seriesData.map(series => series.series_id);
        
        // Skip if no series found
        if (seriesIds.length === 0) {
          throw new Error("No series found for this league");
        }

        // Get all teams from series_members that are in this league
        const { data: leagueTeams, error: teamsError } = await supabase
          .from('series_members')
          .select('team_id')
          .in('series_id', seriesIds);
          
        if (teamsError) throw teamsError;
        
        // Get non-bot teams from the league teams
        const teamIds = leagueTeams.map(member => member.team_id);
        
        // Skip if no teams found
        if (teamIds.length === 0) {
          throw new Error("No teams found in this league");
        }
        
        const { data: nonBotTeams, error: nonBotError } = await supabase
          .from('teams')
          .select('team_id, manager_id')
          .in('team_id', teamIds)
          .eq('is_bot', 0);
        
        if (nonBotError) throw nonBotError;
        
        // Get unique manager IDs (filter out null values)
        const managerIds = nonBotTeams
          .map(team => team.manager_id)
          .filter(id => id !== null);
        
        // Get the team count for each series
        const seriesList = [];
        for (const series of seriesData || []) {
          const { data: seriesMembers, error: membersError } = await supabase
            .from('series_members')
            .select('team_id')
            .eq('series_id', series.series_id);
            
          if (membersError) throw membersError;
          
          // Count non-bot teams in this series
          const { data: seriesNonBotTeams, error: seriesTeamsError } = await supabase
            .from('teams')
            .select('team_id')
            .in('team_id', seriesMembers.map(member => member.team_id))
            .eq('is_bot', 0);
          
          if (seriesTeamsError) throw seriesTeamsError;

          seriesList.push({
            series_id: series.series_id,
            division: series.division,
            group_number: series.group_number,
            team_count: seriesNonBotTeams.length
          });
        }

        setStats({
          regionId: leagueData.region_id,
          regionName: leagueData.leagues_regions.name,
          totalTeams: nonBotTeams.length,
          totalManagers: new Set(managerIds).size,
          totalSeries: seriesList.length,
          seriesList
        });

      } catch (err) {
        console.error('Error fetching league stats:', err);
        setError(err instanceof Error ? err.message : "Failed to fetch league statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [leagueId]);

  return { stats, isLoading, error };
};
