
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

export const useStadiumIdByTeamId = (teamId: number | undefined) => {
  const [stadiumId, setStadiumId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStadiumId = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiFetch<{ success: boolean; stadiumId: number | null }>(
          `/stadiums/by-team/${teamId}`
        );
        setStadiumId(data.stadiumId);
      } catch (err) {
        console.error("Error fetching stadium ID:", err);
        setError(err instanceof Error ? err.message : "Error fetching stadium ID");
      } finally {
        setIsLoading(false);
      }
    };

    if (teamId) fetchStadiumId();
  }, [teamId]);

  return { stadiumId, isLoading, error };
};
