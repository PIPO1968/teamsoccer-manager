
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface StadiumMatch {
  match_id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: string;
  competition: string;
  result: string | null;
}

export const useStadiumMatches = (stadiumId: string | undefined) => {
  const [matches, setMatches] = useState<StadiumMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStadiumMatches = async () => {
      if (!stadiumId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // First get the stadium to find the home team
        const { data: stadiumData, error: stadiumError } = await supabase
          .from("stadiums")
          .select("team_id")
          .eq("stadium_id", parseInt(stadiumId))
          .single();

        if (stadiumError) throw stadiumError;
        
        if (!stadiumData) {
          setMatches([]);
          setIsLoading(false);
          return;
        }

        // Fetch matches where this team is the home team (matches at this stadium)
        const { data: matchesData, error: matchesError } = await supabase
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
            series_id
          `)
          .eq('home_team_id', stadiumData.team_id)
          .order('match_date', { ascending: false });

        if (matchesError) throw matchesError;

        if (matchesData && matchesData.length > 0) {
          // Get all unique team IDs from the matches
          const teamIds = Array.from(new Set([
            ...matchesData.map(m => m.home_team_id),
            ...matchesData.map(m => m.away_team_id)
          ]));
          
          // Fetch team names separately
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('team_id, name')
            .in('team_id', teamIds);
            
          if (teamsError) throw teamsError;
          
          // Create a map of team IDs to team names
          const teamNames = teamsData?.reduce((acc, team) => {
            acc[team.team_id] = team.name;
            return acc;
          }, {} as Record<number, string>) || {};
          
          // Transform the data to match our StadiumMatch interface
          const transformedData = matchesData.map(match => ({
            match_id: match.match_id_int,
            home_team_id: match.home_team_id,
            away_team_id: match.away_team_id,
            home_team_name: teamNames[match.home_team_id] || 'Unknown Team',
            away_team_name: teamNames[match.away_team_id] || 'Unknown Team',
            home_score: match.home_score,
            away_score: match.away_score,
            match_date: match.match_date,
            status: match.status,
            competition: match.is_friendly ? 'Friendly Match' : 'League Match',
            result: getMatchResult(match)
          }));
          
          setMatches(transformedData);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("Error fetching stadium matches:", err);
        setError(err instanceof Error ? err.message : "Error fetching matches data");
        toast({
          title: "Error",
          description: "Failed to load stadium matches. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStadiumMatches();
  }, [stadiumId]);
  
  // Helper function to determine match result
  const getMatchResult = (match: any): string | null => {
    if (match.status !== 'completed') return null;
    
    if (match.home_score > match.away_score) return 'Win';
    if (match.home_score < match.away_score) return 'Loss';
    return 'Draw';
  };

  return { matches, isLoading, error };
};
