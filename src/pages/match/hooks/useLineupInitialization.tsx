
import { useEffect } from "react";
import { PlayerData } from "@/hooks/useTeamPlayers";

interface LineupInitializationProps {
  players: PlayerData[] | undefined;
  matchId: number | undefined;
  teamId: number | undefined;
  selectedFormation: string;
  setSelectedPlayers: React.Dispatch<React.SetStateAction<{[key: string]: PlayerData}>>;
  setSubstitutes: React.Dispatch<React.SetStateAction<PlayerData[]>>;
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  loadLineup: (matchId: number, teamId: number) => Promise<any>;
}

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

export const useLineupInitialization = ({
  players,
  matchId,
  teamId,
  selectedFormation,
  setSelectedPlayers,
  setSubstitutes,
  setIsComplete,
  loadLineup
}: LineupInitializationProps) => {
  
  // Function to initialize the lineup with best players by position
  const initializeDefaultLineup = (playerList: PlayerData[]) => {
    // Create default lineup based on best players by position
    const goalkeepers = playerList.filter(p => p.position === "GK").sort((a, b) => b.rating - a.rating);
    const defenders = playerList.filter(p => ["CB", "LB", "RB"].includes(p.position)).sort((a, b) => b.rating - a.rating);
    const midfielders = playerList.filter(p => ["CM", "CDM", "CAM", "LM", "RM"].includes(p.position)).sort((a, b) => b.rating - a.rating);
    const forwards = playerList.filter(p => ["ST", "CF", "LW", "RW"].includes(p.position)).sort((a, b) => b.rating - a.rating);
    
    const initialLineup: {[key: string]: PlayerData} = {};
    
    // Assign GK
    if (goalkeepers.length > 0) {
      initialLineup["GK"] = goalkeepers[0];
    }
    
    // Parse formation to get counts
    const formationParts = selectedFormation.split('-');
    const defCount = parseInt(formationParts[0]);
    const midCount = parseInt(formationParts[1]);
    const fwdCount = parseInt(formationParts[2] || '0');
    
    // Assign defenders
    for (let i = 0; i < defCount && i < defenders.length; i++) {
      initialLineup[`DEF${i+1}`] = defenders[i];
    }
    
    // Assign midfielders
    for (let i = 0; i < midCount && i < midfielders.length; i++) {
      initialLineup[`MID${i+1}`] = midfielders[i];
    }
    
    // Assign forwards
    for (let i = 0; i < fwdCount && i < forwards.length; i++) {
      initialLineup[`FWD${i+1}`] = forwards[i];
    }
    
    setSelectedPlayers(initialLineup);
    
    // Set substitutes (players not in the starting 11)
    const starters = Object.values(initialLineup);
    const subs = playerList
      .filter(p => !starters.some(s => s && s.player_id === p.player_id))
      .slice(0, 7); // Maximum 7 substitutes
      
    setSubstitutes(subs);

    // Check if lineup is complete
    checkLineupCompleteness(initialLineup);
  };

  // Check if the lineup has all required positions filled
  const checkLineupCompleteness = (lineup: {[key: string]: PlayerData}) => {
    const { isValid } = validateLineup(selectedFormation, lineup);
    setIsComplete(isValid);
  };
  
  // Initialize the lineup when players are loaded
  useEffect(() => {
    if (players && players.length > 0) {
      // Try to load saved lineup first
      const loadSavedLineup = async () => {
        if (matchId && teamId) {
          const savedData = await loadLineup(matchId, teamId);
          
          if (savedData) {
            // Convert player IDs back to player objects
            const positionMap: {[key: string]: PlayerData} = {};
            const playerIdMap: {[key: number]: PlayerData} = {};
            
            // Create a map of player IDs to player objects for quick lookup
            players.forEach(player => {
              playerIdMap[player.player_id] = player;
            });
            
            // Map positions to players
            Object.entries(savedData.player_positions).forEach(([position, playerId]) => {
              const player = playerIdMap[playerId as number];
              if (player) {
                positionMap[position] = player;
              }
            });
            
            // Set player positions
            setSelectedPlayers(positionMap);
            
            // Set substitutes
            const subs = savedData.substitutes
              .map((id: number) => playerIdMap[id])
              .filter((p: PlayerData | undefined): p is PlayerData => p !== undefined);
            
            setSubstitutes(subs);
            
            // Check completeness
            checkLineupCompleteness(positionMap);
            
            return true;
          }
        }
        return false;
      };
      
      loadSavedLineup().then(lineupLoaded => {
        if (!lineupLoaded) {
          // No saved lineup, create default
          initializeDefaultLineup(players);
        }
      });
    }
  }, [players, matchId, teamId]);

  return {
    checkLineupCompleteness
  };
};
