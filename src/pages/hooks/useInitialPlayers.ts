
import { useState, useEffect } from "react";
import { Player } from "../components/types/match";
import { useTeamPlayers, PlayerData } from "@/hooks/useTeamPlayers";

// Map player position to coordinates on the pitch
const getPlayerCoordinates = (position: string): { x: number, y: number } => {
  // Default to center if position is unknown
  const defaultPos = { x: 50, y: 50 };
  
  const positionMap: Record<string, { x: number, y: number }> = {
    // Goalkeeper
    'GK': { x: 50, y: 95 },
    
    // Defenders
    'CB': { x: 50, y: 80 },
    'LB': { x: 20, y: 80 },
    'RB': { x: 80, y: 80 },
    'LWB': { x: 20, y: 75 },
    'RWB': { x: 80, y: 75 },
    
    // Midfielders
    'CDM': { x: 50, y: 65 },
    'CM': { x: 50, y: 60 },
    'LM': { x: 20, y: 60 },
    'RM': { x: 80, y: 60 },
    'CAM': { x: 50, y: 45 },
    
    // Forwards
    'LW': { x: 25, y: 30 },
    'RW': { x: 75, y: 30 },
    'ST': { x: 50, y: 20 },
    'CF': { x: 50, y: 30 }
  };
  
  // Try to find an exact match first
  if (positionMap[position]) {
    return positionMap[position];
  }
  
  // If not found, try to find by first two characters
  const positionPrefix = position.substring(0, 2);
  for (const [key, value] of Object.entries(positionMap)) {
    if (key.startsWith(positionPrefix)) {
      return value;
    }
  }
  
  return defaultPos;
};

const mapPlayerDataToPlayer = (playerData: PlayerData): Player => {
  const position = playerData.position || 'CM';
  const coordinates = getPlayerCoordinates(position);
  
  return {
    id: playerData.player_id,
    firstName: playerData.first_name,
    lastName: playerData.last_name,
    name: `${playerData.first_name} ${playerData.last_name}`,
    position: position,
    x: coordinates.x,
    y: coordinates.y,
    form: playerData.form || 'Average',
    energy: playerData.fitness || 100,
    rating: playerData.rating || 5,
    // Map player attributes for simulation
    finishing: playerData.finishing || 10,
    passing: playerData.passing || 10,
    dribbling: playerData.dribbling || 10,
    defense: playerData.defense || 10,
    fitness: playerData.fitness || 90,
    // Store the original PlayerData for use in avatar and details
    playerData: playerData
  };
};

interface UseInitialPlayersProps {
  matchId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
}

export const useInitialPlayers = ({ 
  matchId, 
  homeTeamId, 
  awayTeamId 
}: UseInitialPlayersProps) => {
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch players for both teams
  const { players: homeTeamPlayers, isLoading: isHomeLoading } = useTeamPlayers(homeTeamId?.toString());
  const { players: awayTeamPlayers, isLoading: isAwayLoading } = useTeamPlayers(awayTeamId?.toString());
  
  useEffect(() => {
    if (!homeTeamId || !awayTeamId) {
      setIsLoading(false);
      return;
    }
    
    // Wait for both teams' players to load
    if (isHomeLoading || isAwayLoading) {
      setIsLoading(true);
      return;
    }
    
    try {
      // Get 11 players from home team (prioritize certain positions)
      const getStartingEleven = (players: PlayerData[]): Player[] => {
        if (!players || players.length === 0) {
          console.warn("No players found for team");
          return [];
        }
        
        // Sort players by position priority and rating
        const positionPriority = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];
        
        const sortedPlayers = [...players].sort((a, b) => {
          const aPriority = positionPriority.indexOf(a.position) !== -1 ? positionPriority.indexOf(a.position) : 999;
          const bPriority = positionPriority.indexOf(b.position) !== -1 ? positionPriority.indexOf(b.position) : 999;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // If same position priority, sort by rating
          return (b.rating || 0) - (a.rating || 0);
        });
        
        // Take first 11 players and map them
        return sortedPlayers.slice(0, 11).map(mapPlayerDataToPlayer);
      };
      
      const mappedHomePlayers = getStartingEleven(homeTeamPlayers);
      const mappedAwayPlayers = getStartingEleven(awayTeamPlayers);
      
      console.log("Mapped home players:", mappedHomePlayers);
      console.log("Mapped away players:", mappedAwayPlayers);
      
      setHomePlayers(mappedHomePlayers);
      setAwayPlayers(mappedAwayPlayers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing players:", error);
      setIsLoading(false);
    }
  }, [homeTeamId, awayTeamId, homeTeamPlayers, awayTeamPlayers, isHomeLoading, isAwayLoading]);
  
  return { homePlayers, awayPlayers, isLoading };
};
