
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
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

        const data = await apiFetch<{ success: boolean; matches: StadiumMatch[] }>(
          `/stadiums/${parseInt(stadiumId)}/matches`
        );
        setMatches(data.matches || []);
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

  return { matches, isLoading, error };
};
