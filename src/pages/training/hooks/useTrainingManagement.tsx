
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

  // Load existing training assignments
  useEffect(() => {
    const loadTrainingAssignments = async () => {
      if (!players.length) return;

      try {
        const { data, error } = await supabase
          .from('player_training_assignments')
          .select('player_id, training_type, training_intensity')
          .in('player_id', players.map(p => p.player_id));

        if (error) throw error;

        const trainingMap = new Map<number, PlayerTraining>();
        data?.forEach(assignment => {
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

      const { error } = await supabase
        .from('player_training_assignments')
        .upsert(assignments, {
          onConflict: 'player_id'
        });

      if (error) throw error;

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

  return {
    playerTrainings,
    isSaving,
    handleTrainingTypeChange,
    handleIntensityChange,
    saveAllTrainings
  };
};
