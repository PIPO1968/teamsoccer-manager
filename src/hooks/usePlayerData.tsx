
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlayerWithTeam {
  player_id: number;
  first_name: string;
  last_name: string;
  position: string;
  age: number;
  nationality_id?: number;
  nationality?: string;
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
  team?: {
    name: string;
  };
}

export const usePlayerData = (playerId: string | undefined) => {
  const [player, setPlayer] = useState<PlayerWithTeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("players")
          .select(`
            *,
            leagues_regions:nationality_id (name),
            teams (name)
          `)
          .eq("player_id", parseInt(playerId))
          .single();

        if (error) throw error;

        // Map the data to include nationality from the join
        const playerWithNationality = {
          ...data,
          nationality: data.leagues_regions?.name || 'Unknown',
          team: data.teams ? { name: data.teams.name } : undefined
        };

        setPlayer(playerWithNationality);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching player:", err);
        setError(err instanceof Error ? err.message : "Error fetching player");
        setIsLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  return { player, isLoading, error };
};
