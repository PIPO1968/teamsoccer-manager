
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/services/apiClient";

export type PlayerData = {
  player_id: number;
  first_name: string;
  last_name: string;
  position: string;
  age: number;
  nationality_id?: number;
  nationality?: string; // Computed field from join
  value: number;
  wage: number;
  fitness: number;
  form: string;
  contract_until: string;
  finishing: number;
  pace: number;
  passing: number;
  defense: number;
  dribbling: number;
  heading: number;
  stamina: number;
  team_id: number | null;
  goals: number;
  assists: number;
  matches_played: number;
  minutes_played: number;
  rating: number;
  personality: number;
  experience: number;
  leadership: number;
  loyalty: number;
  owned_since: string | null;
  goalkeeper?: number;
  crosses?: number;
  avatar_seed?: string;
  avatar_hair_style?: number;
  avatar_hair_color?: number;
  avatar_skin_tone?: number;
  avatar_eye_style?: number;
  avatar_eye_color?: number;
  avatar_mouth_style?: number;
  avatar_eyebrows?: number;
  avatar_shirt_color?: number;
  avatar_background_color?: number;
};

export const useTeamPlayers = (teamId: string | undefined) => {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiFetch<{ success: boolean; players: PlayerData[] }>(
        `/teams/${parseInt(teamId)}/players`
      );
      setPlayers(data.players || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching players:", err);
      setError(err instanceof Error ? err.message : "Error fetching players");
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchPlayers();
  }, [teamId, fetchPlayers]);

  const refetch = useCallback(() => {
    return fetchPlayers();
  }, [fetchPlayers]);

  return { players, isLoading, error, refetch };
};
