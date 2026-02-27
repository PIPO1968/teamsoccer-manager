
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      if (!seriesId) return;

      const parsedSeriesId = parseInt(seriesId, 10);
      if (isNaN(parsedSeriesId)) {
        setError("Invalid series ID");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch series info with league and region data
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select(`
            series_id,
            division,
            group_number,
            division_level,
            season,
            league:leagues!inner (
              league_id,
              region:leagues_regions!inner (
                region_id,
                name
              )
            )
          `)
          .eq('series_id', parsedSeriesId)
          .single();

        if (seriesError) throw seriesError;
        if (!seriesData) throw new Error("Series not found");

        // Fetch team standings directly
        const { data: teamsData, error: teamsError } = await supabase
          .from('team_series_stats')
          .select(`
            team_id,
            played,
            won,
            drawn,
            lost,
            goals_for,
            goals_against,
            points,
            form,
            teams (
              name,
              club_logo,
              is_bot
            )
          `)
          .eq('series_id', parsedSeriesId);

        if (teamsError) throw teamsError;

        // Format teams data
        const formattedTeams = teamsData.map(team => ({
          team_id: team.team_id,
          team_name: team.teams?.name || "Unknown Team",
          team_logo: team.teams?.club_logo || null,
          played: team.played,
          won: team.won,
          drawn: team.drawn,
          lost: team.lost,
          goals_for: team.goals_for,
          goals_against: team.goals_against,
          goal_difference: team.goals_for - team.goals_against,
          points: team.points,
          form: team.form || [],
          is_bot: team.teams?.is_bot || 0
        }));

        // Sort teams by points, goal difference, etc.
        formattedTeams.sort((a, b) => {
          if (a.points !== b.points) return b.points - a.points;
          if (a.goal_difference !== b.goal_difference) return b.goal_difference - a.goal_difference;
          if (a.goals_for !== b.goals_for) return b.goals_for - a.goals_for;
          return a.team_name.localeCompare(b.team_name);
        });

        setLeague({
          series_id: seriesData.series_id,
          league_id: seriesData.league.league_id,
          league_name: seriesData.league.region.name,
          division: seriesData.division,
          group_number: seriesData.group_number,
          region_id: seriesData.league.region.region_id, // Include region_id in the returned data
          region_name: seriesData.league.region.name,
          season: seriesData.season,
          teams: formattedTeams
        });

      } catch (err) {
        console.error("Error fetching league data:", err);
        setError(err instanceof Error ? err.message : "Error fetching league data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueData();
  }, [seriesId]);

  return { league, isLoading, error };
};
