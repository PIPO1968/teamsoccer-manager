
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
import { toast } from "@/components/ui/use-toast";

export interface TeamMatch {
  match_id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_country_name: string;
  away_country_name: string;
  home_timezone: string;
  away_timezone: string;
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

        const parsedTeamId = parseInt(teamId);
        if (isNaN(parsedTeamId)) throw new Error("Invalid team ID");

        const data = await apiFetch<{ success: boolean; matches: TeamMatch[] }>(
          `/teams/${parsedTeamId}/matches`
        );
        setMatches(data.matches || []);
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

  return { matches, isLoading, error };
};
