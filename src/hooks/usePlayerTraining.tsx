
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

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
        const data = await apiFetch<{ success: boolean; assignments: PlayerTrainingAssignment[] }>(
          `/teams/${parseInt(teamId)}/training`
        );
        setAssignments(data.assignments || []);
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
      await apiFetch(`/players/${playerId}/training`, {
        method: 'PUT',
        body: JSON.stringify({ trainingType, intensity }),
      });

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
            id: Date.now(),
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
