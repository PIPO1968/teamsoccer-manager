
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    const fetchLeague = async () => {
      if (!teamId) {
        setLeague(null);
        setIsLoading(false);
        return;
      }

      await fetchLeagueForTeam(teamId);
    };

    const fetchLeagueForTeam = async (id: string) => {
      try {
        console.log(`Fetching league for team ID: ${id}`);

        const { data, error: fetchError } = await supabase
          .from('series_members')
          .select(`
            series_id,
            series:series!inner (
              series_id,
              division,
              group_number,
              league:leagues!inner (
                league_id,
                region:leagues_regions!inner (
                  name
                )
              )
            )
          `)
          .eq('team_id', parseInt(id))
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          console.log("League data found:", data);
          setLeague({
            series_id: data.series_id,
            league_id: data.series.league.league_id,
            division: data.series.division,
            group_number: data.series.group_number,
            region_name: data.series.league.region.name,
          });
        } else {
          console.log(`No league found for team ID: ${id}`);
          setLeague(null);
        }
      } catch (err) {
        console.error("Error fetching team league:", err);
        setError(err instanceof Error ? err.message : "Error fetching team league");
        setLeague(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeague();
  }, [teamId]);
  // Solo lógica real: nada de demo

  return { league, isLoading, error };
};
