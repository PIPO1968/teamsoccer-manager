
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
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

        const data = await apiFetch<{ success: boolean; match: MatchDetails }>(
          `/matches/${matchId}`
        );
        setMatch(data.match);

        if (data.match?.status === 'completed') {
          try {
            const hlData = await apiFetch<{ success: boolean; highlights: MatchHighlight[] }>(
              `/matches/${matchId}/highlights`
            );
            setHighlights(hlData.highlights || []);
          } catch {
            // highlights no críticos
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
