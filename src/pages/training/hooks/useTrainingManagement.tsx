
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
import { useToast } from "@/hooks/use-toast";
import { PlayerData } from "@/hooks/useTeamPlayers";

interface PlayerTraining {
  playerId: number;
  trainingType: number;
  intensity: number;
}

export const useTrainingManagement = (players: PlayerData[]) => {
  const [playerTrainings, setPlayerTrainings] = useState<Map<number, PlayerTraining>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTrainingAssignments = async () => {
      if (!players.length) return;
      const teamId = players[0]?.team_id;
      if (!teamId) return;
      try {
        const data = await apiFetch<{ success: boolean; assignments: any[] }>(
          `/teams/${teamId}/training`
        );
        const trainingMap = new Map<number, PlayerTraining>();
        (data.assignments || []).forEach(assignment => {
          trainingMap.set(assignment.player_id, {
            playerId: assignment.player_id,
            trainingType: assignment.training_type,
            intensity: assignment.training_intensity
          });
        });
        setPlayerTrainings(trainingMap);
      } catch (error) {
        console.error('Error loading training assignments:', error);
      }
    };
    loadTrainingAssignments();
  }, [players]);

  const handleTrainingTypeChange = (playerId: number, trainingType: number) => {
    setPlayerTrainings(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(playerId) || { playerId, trainingType: 0, intensity: 100 };
      newMap.set(playerId, { ...current, trainingType });
      return newMap;
    });
  };

  const handleIntensityChange = (playerId: number, intensity: number) => {
    setPlayerTrainings(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(playerId) || { playerId, trainingType: 0, intensity: 100 };
      newMap.set(playerId, { ...current, intensity });
      return newMap;
    });
  };

  const saveAllTrainings = async () => {
    setIsSaving(true);
    try {
      const assignments = Array.from(playerTrainings.values()).map(training => ({
        player_id: training.playerId,
        training_type: training.trainingType,
        training_intensity: training.intensity
      }));

      await apiFetch('/players/training/batch', {
        method: 'POST',
        body: JSON.stringify({ assignments }),
      });

      toast({
        title: "Training Saved",
        description: "All training assignments have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving training assignments:', error);
      toast({
        title: "Error",
        description: "Failed to save training assignments.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { playerTrainings, isSaving, handleTrainingTypeChange, handleIntensityChange, saveAllTrainings };
};
