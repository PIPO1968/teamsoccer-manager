
import { Player } from "../../../../components/types/match";
import { GameState } from "../types/engineTypes";

/**
 * Calculate player selection weight based on field position and game state
 */
export const getPlayerSelectionWeight = (player: Player, gameState: GameState): number => {
  // Base weight is 1
  let weight = 1;
  
  // Adjust weight based on player position
  switch (player.position) {
    case 'ST':
    case 'CF':
      weight = gameState === 'dangerousAttack' ? 3 : 1;
      break;
    case 'CAM':
    case 'LW':
    case 'RW':
      weight = gameState === 'attacking' || gameState === 'dangerousAttack' ? 2 : 1;
      break;
    case 'CDM':
    case 'CM':
      weight = gameState === 'buildup' ? 2 : 1;
      break;
    case 'CB':
    case 'GK':
      weight = gameState === 'defending' ? 2 : 0.5;
      break;
    default:
      weight = 1;
  }
  
  // Adjust weight based on player attributes
  const skillFactor = ((player.finishing || 10) + 
                       (player.passing || 10) + 
                       (player.dribbling || 10)) / 30;
  
  return weight * skillFactor;
};

/**
 * Select a random player from the team based on weights from current state
 */
export const selectPlayerForAction = (players: Player[], gameState: GameState): Player => {
  // Calculate weights for each player
  const weights = players.map(p => getPlayerSelectionWeight(p, gameState));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Select a player with weighted probability
  let random = Math.random() * totalWeight;
  for (let i = 0; i < players.length; i++) {
    if (random < weights[i]) {
      return players[i];
    }
    random -= weights[i];
  }
  
  // Fallback to a random player
  return players[Math.floor(Math.random() * players.length)];
};
