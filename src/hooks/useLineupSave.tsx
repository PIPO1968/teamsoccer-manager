
import { useState } from "react";
import { PlayerData } from "@/hooks/useTeamPlayers";
import { apiFetch } from "@/services/apiClient";
import { toast } from "@/components/ui/use-toast";

interface SaveLineupParams {
  matchId: number;
  teamId: number;
  formation: string;
  selectedPlayers: { [key: string]: PlayerData };
  substitutes: PlayerData[];
}

export const useLineupSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedLineup, setSavedLineup] = useState<any>(null);

  const validateLineup = (formation: string, selectedPlayers: { [key: string]: PlayerData }) => {
    const formationParts = formation.split('-');
    const defenders = parseInt(formationParts[0]);
    const midfielders = parseInt(formationParts[1]);
    const forwards = parseInt(formationParts[2] || '0');

    const requiredPositions = ['GK'];
    for (let i = 1; i <= defenders; i++) requiredPositions.push(`DEF${i}`);
    for (let i = 1; i <= midfielders; i++) requiredPositions.push(`MID${i}`);
    for (let i = 1; i <= forwards; i++) requiredPositions.push(`FWD${i}`);

    const missingPositions = requiredPositions.filter(pos => !selectedPlayers[pos]);
    return { isValid: missingPositions.length === 0, missingPositions };
  };

  const saveLineup = async ({ matchId, teamId, formation, selectedPlayers, substitutes }: SaveLineupParams) => {
    try {
      setIsSaving(true);

      const { isValid, missingPositions } = validateLineup(formation, selectedPlayers);
      if (!isValid) {
        toast({
          title: "Incomplete Lineup",
          description: `Please assign players to all positions: ${missingPositions.join(', ')}`,
          variant: "destructive",
        });
        return false;
      }

      const playerPositions: Record<string, number> = {};
      Object.entries(selectedPlayers).forEach(([position, player]) => {
        if (player) playerPositions[position] = player.player_id;
      });
      const substituteIds = substitutes.map(player => player.player_id);

      await apiFetch(`/matches/${matchId}/lineup`, {
        method: 'POST',
        body: JSON.stringify({ teamId, formation, playerPositions, substitutes: substituteIds }),
      });

      toast({
        title: "Lineup Saved",
        description: "Your lineup has been saved successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error saving lineup:", error);
      toast({
        title: "Error",
        description: "Failed to save lineup. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadLineup = async (matchId: number, teamId: number) => {
    try {
      const data = await apiFetch<{ success: boolean; lineup: any }>(
        `/matches/${matchId}/lineup/${teamId}`
      );
      setSavedLineup(data.lineup || null);
      return data.lineup || null;
    } catch (error) {
      console.error("Error loading lineup:", error);
      return null;
    }
  };

  return {
    isSaving,
    savedLineup,
    saveLineup,
    loadLineup,
    validateLineup
  };
};
