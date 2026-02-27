
import { EventProbabilities, GameState, FieldPosition } from "../types/engineTypes";
import { Player } from "../../../../components/types/match";

/**
 * Calculate base event probabilities based on game state, field position and player attributes
 */
export const calculateEventProbabilities = (
  gameState: GameState, 
  fieldPosition: FieldPosition,
  player: Player,
  intensity: number,
  lastAction: string
): EventProbabilities => {
  const baseProbability = 0.05;
  
  // Base probabilities
  const probabilities: EventProbabilities = {
    goal: baseProbability * 0.2,
    shot: baseProbability,
    save: baseProbability,
    pass: baseProbability * 5,
    dribble: baseProbability * 2,
    tackle: baseProbability,
    corner: baseProbability,
    foul: baseProbability * 0.5,
    yellowCard: baseProbability * 0.1,
    redCard: baseProbability * 0.02,
    injury: baseProbability * 0.05,
    outOfField: baseProbability,
    throwIn: baseProbability
  };
  
  // Adjust for player attributes
  const finishing = player.finishing || 10;
  probabilities.goal *= finishing / 10;
  probabilities.shot *= finishing / 10;
  
  const passing = player.passing || 10;
  probabilities.pass *= passing / 10;
  
  const dribbling = player.dribbling || 10;
  probabilities.dribble *= dribbling / 10;
  
  const defense = player.defense || 10;
  probabilities.tackle *= defense / 10;
  
  // Adjust for stamina/fitness
  const fitness = player.fitness || 90;
  probabilities.injury *= (100 - fitness) / 50;
  
  // Adjust based on field position
  switch (fieldPosition) {
    case 'defense':
      probabilities.goal = 0; // Can't score from defense
      probabilities.shot = 0; // Can't shoot from defense
      probabilities.pass *= 2; // More passing in defense
      probabilities.dribble *= 0.5; // Less dribbling
      break;
    case 'defenseHalf':
      probabilities.goal = 0; // Unlikely to score from defense half
      probabilities.shot *= 0.1; // Very rare long shots
      probabilities.pass *= 1.5;
      break;
    case 'midfield':
      probabilities.goal *= 0.2; // Rare goals from midfield
      probabilities.shot *= 0.5; // Occasional long shots
      probabilities.pass *= 1.2;
      break;
    case 'attackingHalf':
      probabilities.goal *= 0.5; // Moderate chance of goals
      probabilities.shot *= 1.5; // More shots
      probabilities.corner *= 1.5; // More corners
      break;
    case 'attackingThird':
      probabilities.goal *= 3; // Much higher chance of goals
      probabilities.shot *= 3; // Many more shots
      probabilities.corner *= 2; // More corners
      break;
  }
  
  // Adjust for game state
  switch (gameState) {
    case 'dangerousAttack':
      probabilities.goal *= 5;
      probabilities.shot *= 4;
      probabilities.corner *= 3;
      break;
    case 'attacking':
      probabilities.goal *= 2;
      probabilities.shot *= 3;
      break;
    case 'counterAttack':
      probabilities.goal *= 3;
      probabilities.shot *= 2;
      probabilities.dribble *= 3;
      break;
    case 'setpiece':
      probabilities.goal *= 2.5;
      probabilities.corner *= 2;
      break;
    case 'corner':
      probabilities.goal *= 2;
      probabilities.shot *= 3;
      break;
    case 'throwIn':
      probabilities.pass *= 2;
      probabilities.dribble *= 1.5;
      break;
  }
  
  // Adjust based on previous action
  if (lastAction === 'dribble') {
    probabilities.tackle *= 2; // Tackling more likely after dribbling
  }
  if (lastAction === 'tackle') {
    probabilities.injury *= 1.5; // Injuries more likely after tackles
  }
  
  // Tackle can only happen if the opponent is moving forward
  if (gameState === 'defending' || gameState === 'buildup') {
    probabilities.tackle *= 2;
  } else {
    probabilities.tackle *= 0.5;
  }
  
  // Adjust for match intensity - more fouls/cards at high intensity
  probabilities.foul *= intensity / 5;
  probabilities.yellowCard *= intensity / 5;
  probabilities.redCard *= (intensity / 5) * (intensity / 5); // exponential for red cards
  
  return probabilities;
};
