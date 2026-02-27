
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlayerTrainingAssignment {
  id: number;
  player_id: number;
  training_type: number;
  training_intensity: number;
  created_at: string;
  updated_at: string;
}

export const usePlayerTraining = (teamId: string | undefined) => {
  const [assignments, setAssignments] = useState<PlayerTrainingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingAssignments = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get all player IDs for the team first
        const { data: players, error: playersError } = await supabase
          .from("players")
          .select("player_id")
          .eq("team_id", parseInt(teamId));

        if (playersError) throw playersError;

        if (!players || players.length === 0) {
          setAssignments([]);
          setIsLoading(false);
          return;
        }

        const playerIds = players.map(p => p.player_id);

        // Fetch training assignments for these players
        const { data, error } = await supabase
          .from("player_training_assignments")
          .select("*")
          .in("player_id", playerIds);

        if (error) throw error;

        setAssignments((data as PlayerTrainingAssignment[]) || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching training assignments:", err);
        setError(err instanceof Error ? err.message : "Error fetching training assignments");
        setIsLoading(false);
      }
    };

    fetchTrainingAssignments();
  }, [teamId]);

  const updateTrainingAssignment = async (
    playerId: number, 
    trainingType: number, 
    intensity: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("player_training_assignments")
        .upsert({
          player_id: playerId,
          training_type: trainingType,
          training_intensity: intensity
        }, {
          onConflict: 'player_id'
        });

      if (error) throw error;

      // Update local state
      setAssignments(prev => {
        const existing = prev.find(a => a.player_id === playerId);
        if (existing) {
          return prev.map(a => 
            a.player_id === playerId 
              ? { ...a, training_type: trainingType, training_intensity: intensity }
              : a
          );
        } else {
          return [...prev, {
            id: Date.now(), // Temporary ID
            player_id: playerId,
            training_type: trainingType,
            training_intensity: intensity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
        }
      });

      return true;
    } catch (err) {
      console.error("Error updating training assignment:", err);
      setError(err instanceof Error ? err.message : "Error updating training assignment");
      return false;
    }
  };

  return { 
    assignments, 
    isLoading, 
    error, 
    updateTrainingAssignment 
  };
};
