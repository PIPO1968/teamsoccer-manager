
import { useState, useEffect } from "react";
import { PlayerData } from "@/hooks/useTeamPlayers";
import { useFormationManagement } from "./useFormationManagement";
import { usePlayerSelectionAndSwap } from "./usePlayerSelectionAndSwap";
import { useLineupSaveHandler } from "./useLineupSaveHandler";
import { useLineupInitialization } from "./useLineupInitialization";

interface LineupManagementProps {
  players: PlayerData[] | undefined;
  matchId: number | undefined;
  teamId: number | undefined;
}

export const useLineupManagement = ({ players, matchId, teamId }: LineupManagementProps) => {
  const [selectedPlayers, setSelectedPlayers] = useState<{[key: string]: PlayerData}>({});
  const [substitutes, setSubstitutes] = useState<PlayerData[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  // Initialize player selection and swapping hooks
  const {
    selectedPlayer,
    setSelectedPlayer,
    handlePlayerSelect,
    handlePlayerSwap: baseHandlePlayerSwap,
    handleSubstituteSwap: baseHandleSubstituteSwap
  } = usePlayerSelectionAndSwap();
  
  // Initialize formation management hook
  const {
    selectedFormation,
    handleFormationChange: baseHandleFormationChange
  } = useFormationManagement({
    selectedPlayers,
    setSubstitutes
  });
  
  // Initialize lineup save handler
  const {
    isSaving,
    handleSaveLineup,
    loadLineup,
    validateLineup
  } = useLineupSaveHandler({
    matchId,
    teamId,
    selectedFormation,
    selectedPlayers,
    substitutes
  });
  
  // Initialize lineup initialization hook
  const {
    checkLineupCompleteness
  } = useLineupInitialization({
    players,
    matchId,
    teamId,
    selectedFormation,
    setSelectedPlayers,
    setSubstitutes,
    setIsComplete,
    loadLineup
  });
  
  // Handle formation change with state updates
  const handleFormationChange = (formation: string) => {
    const newLineup = baseHandleFormationChange(formation);
    setSelectedPlayers(newLineup);
  };
  
  // Handle player swap with dependencies
  const handlePlayerSwap = (position: string, player: PlayerData) => {
    baseHandlePlayerSwap(
      position, 
      player, 
      selectedPlayers, 
      setSelectedPlayers,
      setSubstitutes
    );
  };
  
  // Handle substitute swap with dependencies
  const handleSubstituteSwap = (player: PlayerData) => {
    baseHandleSubstituteSwap(
      player, 
      selectedPlayers, 
      setSelectedPlayers,
      substitutes,
      setSubstitutes
    );
  };
  
  // Update lineup completeness whenever players or formation changes
  useEffect(() => {
    checkLineupCompleteness(selectedPlayers);
  }, [selectedPlayers, selectedFormation]);

  return {
    selectedFormation,
    setSelectedFormation: handleFormationChange,
    selectedPlayers,
    substitutes,
    selectedPlayer,
    isComplete,
    isSaving,
    handlePlayerSelect,
    handlePlayerSwap,
    handleSubstituteSwap,
    handleSaveLineup
  };
};
