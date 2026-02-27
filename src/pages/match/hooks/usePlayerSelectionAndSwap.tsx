import { useState } from "react";
import { PlayerData } from "@/hooks/useTeamPlayers";

export const usePlayerSelectionAndSwap = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  
  // Handle selecting a player from the list
  const handlePlayerSelect = (player: PlayerData) => {
    // If the player is already selected, deselect them
    if (selectedPlayer?.player_id === player.player_id) {
      setSelectedPlayer(null);
    } else {
      // Otherwise, select the player
      setSelectedPlayer(player);
    }
  };
  
  // Handle assigning a player to a position
  const handlePlayerSwap = (
    position: string, 
    player: PlayerData, 
    selectedPlayers: {[key: string]: PlayerData},
    setSelectedPlayers: React.Dispatch<React.SetStateAction<{[key: string]: PlayerData}>>,
    setSubstitutes: React.Dispatch<React.SetStateAction<PlayerData[]>>
  ) => {
    setSelectedPlayers(prev => {
      // Create a new lineup object
      const newLineup = {...prev};
      
      // If player is already in lineup, find their position
      const playerCurrentPosition = Object.keys(prev).find(
        pos => prev[pos]?.player_id === player.player_id
      );
      
      // If player is coming from substitutes
      if (!playerCurrentPosition) {
        // Add player to selected position
        newLineup[position] = player;
        
        // Move the replaced player to substitutes if there was one
        if (prev[position]) {
          setSubstitutes(subs => [...subs, prev[position]]);
        }
        
        // Remove player from substitutes
        setSubstitutes(subs => 
          subs.filter(p => p && p.player_id !== player.player_id)
        );
      } else {
        // Swap positions if player is already in lineup
        const tempPlayer = prev[position];
        newLineup[position] = player;
        newLineup[playerCurrentPosition] = tempPlayer;
      }
      
      return newLineup;
    });
    
    // Clear selected player after assignment
    setSelectedPlayer(null);
  };
  
  // Handle swapping with a substitute
  const handleSubstituteSwap = (
    player: PlayerData,
    selectedPlayers: {[key: string]: PlayerData},
    setSelectedPlayers: React.Dispatch<React.SetStateAction<{[key: string]: PlayerData}>>,
    substitutes: PlayerData[],
    setSubstitutes: React.Dispatch<React.SetStateAction<PlayerData[]>>
  ) => {
    if (selectedPlayer) {
      // Find if selected player is in starting lineup
      const playerPosition = Object.entries(selectedPlayers).find(
        ([_, p]) => p && p.player_id === selectedPlayer.player_id
      );
      
      if (playerPosition) {
        // If player is in starting lineup, swap with substitute
        const [position, startingPlayer] = playerPosition;
        
        setSelectedPlayers(prev => {
          const newLineup = {...prev};
          newLineup[position] = player;
          return newLineup;
        });
        
        // Update substitutes - remove the substitute that's going in
        setSubstitutes(prev => 
          prev.filter(p => p && p.player_id !== player.player_id).concat(startingPlayer)
        );
      } else {
        // If selected player is a substitute, swap them
        const newSubs = [...substitutes];
        const subIndex = newSubs.findIndex(p => p && p.player_id === player.player_id);
        
        if (subIndex !== -1) {
          const playerIndex = newSubs.findIndex(p => p && p.player_id === selectedPlayer.player_id);
          
          if (playerIndex !== -1) {
            // Swap positions in substitutes array
            [newSubs[subIndex], newSubs[playerIndex]] = [newSubs[playerIndex], newSubs[subIndex]];
            setSubstitutes(newSubs);
          }
        }
      }
      
      // Clear selected player after swap
      setSelectedPlayer(null);
    }
  };

  return {
    selectedPlayer,
    setSelectedPlayer,
    handlePlayerSelect,
    handlePlayerSwap,
    handleSubstituteSwap
  };
};
