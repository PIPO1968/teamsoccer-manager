
import { toast } from "@/components/ui/use-toast";
import { PlayerData } from "@/hooks/useTeamPlayers";
import { useLineupSave } from "@/hooks/useLineupSave";

interface LineupSaveHandlerProps {
  matchId: number | undefined;
  teamId: number | undefined;
  selectedFormation: string;
  selectedPlayers: { [key: string]: PlayerData };
  substitutes: PlayerData[];
}

export const useLineupSaveHandler = ({
  matchId,
  teamId,
  selectedFormation,
  selectedPlayers,
  substitutes
}: LineupSaveHandlerProps) => {
  const { isSaving, saveLineup, loadLineup } = useLineupSave();
  
  // Helper function to validate if a lineup is complete
  const validateLineup = (formation: string, selectedPlayers: { [key: string]: PlayerData }) => {
    // Check if all required positions have players assigned
    const formationParts = formation.split('-');
    const defenders = parseInt(formationParts[0]);
    const midfielders = parseInt(formationParts[1]);
    const forwards = parseInt(formationParts[2] || '0');
    
    // Required positions
    const requiredPositions = ['GK'];
    
    // Add defender positions
    for (let i = 1; i <= defenders; i++) {
      requiredPositions.push(`DEF${i}`);
    }
    
    // Add midfielder positions
    for (let i = 1; i <= midfielders; i++) {
      requiredPositions.push(`MID${i}`);
    }
    
    // Add forward positions
    for (let i = 1; i <= forwards; i++) {
      requiredPositions.push(`FWD${i}`);
    }
    
    // Check if all required positions are filled
    const missingPositions = requiredPositions.filter(pos => !selectedPlayers[pos]);
    
    return {
      isValid: missingPositions.length === 0,
      missingPositions
    };
  };
  
  const handleSaveLineup = async () => {
    if (!matchId || !teamId) {
      toast({
        title: "Error",
        description: "Match or team information is missing.",
        variant: "destructive"
      });
      return;
    }
    
    const result = await saveLineup({
      matchId,
      teamId,
      formation: selectedFormation,
      selectedPlayers,
      substitutes
    });
    
    return result;
  };

  return {
    isSaving,
    handleSaveLineup,
    loadLineup,
    validateLineup
  };
};
