
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

export type StadiumData = {
  stadium_id: number;
  stadium_name: string;
  stadium_capacity: number;
  build_date: string;
  team_id: number;
  team_name: string;
  team_logo: string | null;
  country?: string;
  seats_standing?: number;
  seats_basic?: number;
  seats_covered?: number;
  seats_vip?: number;
};

export const useStadiumData = (stadiumId: string | undefined) => {
  const [stadium, setStadium] = useState<StadiumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStadium = async () => {
    if (!stadiumId) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{ success: boolean; stadium: StadiumData }>(
        `/stadiums/${parseInt(stadiumId)}`
      );
      setStadium(data.stadium);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching stadium:", err);
      setError(err instanceof Error ? err.message : "Error fetching stadium data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStadium();
  }, [stadiumId]);

  return { stadium, isLoading, error, refetch: fetchStadium };
};
