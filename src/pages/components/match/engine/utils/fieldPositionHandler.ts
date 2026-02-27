import { GameState, FieldPosition } from "../types/engineTypes";

/**
 * Determine field position based on game state and previous position
 */
export const getFieldPosition = (state: GameState, previousPosition: FieldPosition): FieldPosition => {
  switch(state) {
    case 'kickoff':
      return 'midfield';
    case 'buildup':
      if (previousPosition === 'defense') return 'defenseHalf';
      if (previousPosition === 'defenseHalf') return 'midfield';
      return previousPosition;
    case 'attacking':
      if (previousPosition === 'midfield') return 'attackingHalf';
      if (previousPosition === 'attackingHalf') return 'attackingThird';
      return previousPosition;
    case 'dangerousAttack':
      return 'attackingThird';
    case 'defending':
      if (previousPosition === 'attackingThird') return 'attackingHalf';
      if (previousPosition === 'attackingHalf') return 'midfield';
      return previousPosition;
    case 'counterAttack':
      if (previousPosition === 'defense') return 'midfield';
      if (previousPosition === 'defenseHalf') return 'attackingHalf';
      if (previousPosition === 'midfield') return 'attackingThird';
      return previousPosition;
    case 'corner':
      return 'attackingThird';
    case 'setpiece':
      // Set pieces can happen anywhere, so keep current position
      return previousPosition;
    case 'goalKick':
      return 'defense';
    case 'throwIn':
      // Throw-ins maintain the current field position
      return previousPosition;
    default:
      return previousPosition;
  }
};
