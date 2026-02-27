
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface MatchDetails {
  match_id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: string;
  is_friendly: boolean;
  series_id: number | null;
  division: number | null;
  group_number: number | null;
  region_name: string | null;
  competition?: string;
  stadium_id?: number;
  stadium_name?: string;
}

export interface MatchHighlight {
  minute: number;
  event_type: string;
  player_name: string;
  team: 'home' | 'away';
  description: string;
}

export const useMatchDetails = (matchId: number | undefined) => {
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [highlights, setHighlights] = useState<MatchHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!matchId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // First, fetch the match data
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select(`
            match_id_int,
            home_team_id,
            away_team_id,
            home_score,
            away_score,
            match_date,
            status,
            is_friendly,
            series_id,
            home:teams!matches_home_team_id_fkey(name, club_logo),
            away:teams!matches_away_team_id_fkey(name, club_logo)
          `)
          .eq('match_id_int', matchId)
          .single();

        if (matchError) {
          throw matchError;
        }

        // If there's a series_id, fetch the series data
        let seriesData = null;
        if (matchData && matchData.series_id) {
          const { data: seriesResponse, error: seriesError } = await supabase
            .from('series')
            .select(`
              division,
              group_number,
              region_id,
              leagues_regions(name)
            `)
            .eq('series_id', matchData.series_id)
            .single();
            
          if (!seriesError && seriesResponse) {
            seriesData = seriesResponse;
          } else {
            console.error("Error fetching series data:", seriesError);
          }
        }

        // Then, fetch the stadium data separately for the home team
        const { data: stadiumData, error: stadiumError } = await supabase
          .from('stadiums')
          .select('stadium_id, name')
          .eq('team_id', matchData.home_team_id)
          .single();

        if (stadiumError) {
          console.error("Error fetching stadium data:", stadiumError);
          // We'll continue even if there's a stadium error, it's not critical
        }

        if (matchData) {
          // Determine competition text based on match type
          let competitionText = 'Match';
          if (matchData.is_friendly) {
            competitionText = 'Friendly Match';
          } else if (matchData.series_id && seriesData?.leagues_regions?.name) {
            competitionText = 'League Match';
          } else {
            competitionText = 'League Match';
          }

          const formattedMatch: MatchDetails = {
            match_id: matchData.match_id_int,
            home_team_id: matchData.home_team_id,
            away_team_id: matchData.away_team_id,
            home_team_name: matchData.home.name,
            away_team_name: matchData.away.name,
            home_team_logo: matchData.home.club_logo,
            away_team_logo: matchData.away.club_logo,
            home_score: matchData.home_score,
            away_score: matchData.away_score,
            match_date: matchData.match_date,
            status: matchData.status,
            is_friendly: matchData.is_friendly,
            series_id: matchData.series_id,
            division: seriesData?.division || null,
            group_number: seriesData?.group_number || null,
            region_name: seriesData?.leagues_regions?.name || null,
            competition: competitionText,
            // Add the stadium data if found
            stadium_id: stadiumData?.stadium_id || null,
            stadium_name: stadiumData?.name || `${matchData.home.name} Stadium`
          };
          
          setMatch(formattedMatch);
          
          if (formattedMatch.status === 'completed') {
            const { data: highlightsData, error: highlightsError } = await supabase
              .rpc('get_match_highlights', { p_match_id: matchId });
            
            if (highlightsError) {
              console.error("Error fetching match highlights:", highlightsError);
            } else if (highlightsData) {
              setHighlights(highlightsData as MatchHighlight[]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching match details:", err);
        setError(err instanceof Error ? err.message : "Error fetching match data");
        toast({
          title: "Error",
          description: "Failed to load match details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchDetails();
  }, [matchId]);

  return { match, highlights, isLoading, error };
};
