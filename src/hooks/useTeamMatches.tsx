
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface TeamMatch {
  match_id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: string;
  is_home: boolean;
  competition: string;
  result: string | null;
}

export const useTeamMatches = (teamId: string | undefined) => {
  const [matches, setMatches] = useState<TeamMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure teamId is a valid number
        const parsedTeamId = parseInt(teamId);
        if (isNaN(parsedTeamId)) {
          throw new Error("Invalid team ID");
        }
        
        // Instead of using the embedded relationship, query the teams separately
        const { data, error: matchError } = await supabase
          .from('matches')
          .select('match_id_int, home_team_id, away_team_id, home_score, away_score, match_date, status, is_friendly, series_id')
          .or(`home_team_id.eq.${parsedTeamId},away_team_id.eq.${parsedTeamId}`);

        if (matchError) {
          console.error("Error fetching team matches:", matchError);
          throw matchError;
        }

        if (data && data.length > 0) {
          console.log("Fetched matches:", data);
          
          // Get all unique team IDs from the matches
          const teamIds = Array.from(new Set([
            ...data.map(m => m.home_team_id),
            ...data.map(m => m.away_team_id)
          ]));
          
          // Fetch team names separately
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('team_id, name')
            .in('team_id', teamIds);
            
          if (teamsError) {
            console.error("Error fetching team names:", teamsError);
            throw teamsError;
          }
          
          // Create a map of team IDs to team names
          const teamNames = teamsData?.reduce((acc, team) => {
            acc[team.team_id] = team.name;
            return acc;
          }, {} as Record<number, string>);
          
          // Transform the data to match our TeamMatch interface
          const transformedData = data.map(match => ({
            match_id: match.match_id_int,
            home_team_id: match.home_team_id,
            away_team_id: match.away_team_id,
            home_team_name: teamNames[match.home_team_id] || 'Unknown Team',
            away_team_name: teamNames[match.away_team_id] || 'Unknown Team',
            home_score: match.home_score,
            away_score: match.away_score,
            match_date: match.match_date,
            status: match.status,
            is_home: match.home_team_id === parsedTeamId,
            competition: match.is_friendly ? 'Friendly Match' : 'League Match',
            result: getMatchResult(match, parsedTeamId)
          }));
          
          setMatches(transformedData);
        } else {
          console.log("No matches found for team ID:", parsedTeamId);
          setMatches([]);
        }
      } catch (err) {
        console.error("Error fetching team matches:", err);
        setError(err instanceof Error ? err.message : "Error fetching matches data");
        toast({
          title: "Error",
          description: "Failed to load matches. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [teamId]);
  
  // Helper function to determine match result from the perspective of the team
  const getMatchResult = (match: any, teamId: number): string | null => {
    if (match.status !== 'completed') return null;
    
    if (match.home_team_id === teamId) {
      // Team is home
      if (match.home_score > match.away_score) return 'Win';
      if (match.home_score < match.away_score) return 'Loss';
      return 'Draw';
    } else {
      // Team is away
      if (match.away_score > match.home_score) return 'Win';
      if (match.away_score < match.home_score) return 'Loss';
      return 'Draw';
    }
  };

  return { matches, isLoading, error };
};
