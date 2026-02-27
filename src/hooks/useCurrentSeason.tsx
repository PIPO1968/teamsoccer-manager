
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

export type SeasonInfo = {
  current_season: number;
  current_week: number;
};

export const useCurrentSeason = () => {
  const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentSeason = async () => {
      try {
        const response = await apiFetch<{ success: boolean; season: SeasonInfo }>(
          "/meta/current-season"
        );
        setSeasonInfo(response.season);
      } catch (err) {
        console.error("Error fetching season info:", err);
        setError(err instanceof Error ? err.message : "Error fetching season info");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentSeason();
  }, []);

  return { seasonInfo, isLoading, error };
};
