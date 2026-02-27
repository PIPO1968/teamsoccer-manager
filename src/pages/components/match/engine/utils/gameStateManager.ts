import { GameState, FieldPosition } from "../types/engineTypes";

/**
 * Get the next game state based on current state, field position, possession and event type
 */
export const getNextGameState = (
  currentState: GameState, 
  fieldPosition: FieldPosition,
  possession: 'home' | 'away',
  eventType?: string
): GameState => {
  // If no specific event, use probabilistic transitions with logical constraints
  // Add positional constraints to state transitions
  if (fieldPosition === 'defense') {
    // In defense, can't jump directly to dangerous attack
    const stateTransitionTable: Record<GameState, Record<string, number>> = {
      'buildup': { 'defenseHalf': 0.6, 'defending': 0.3, 'midfield': 0.1 },
      'defending': { 'buildup': 0.7, 'defenseHalf': 0.3 },
      // Add other states with appropriate transitions
      'kickoff': { 'buildup': 0.9, 'counterAttack': 0.1 },
      'dangerousAttack': { 'attacking': 1.0 }, // Fallback transition
      'attacking': { 'buildup': 0.8, 'defenseHalf': 0.2 },
      'counterAttack': { 'defending': 0.5, 'buildup': 0.5 },
      'setpiece': { 'defending': 0.6, 'buildup': 0.4 },
      'goalKick': { 'buildup': 1.0 },
      'stoppage': { 'buildup': 0.8, 'defending': 0.2 },
      'corner': { 'defending': 1.0 },
      'throwIn': { 'buildup': 1.0 }
    };
    
    const transitions = stateTransitionTable[currentState] || { 'buildup': 1.0 };
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const state in transitions) {
      cumulativeProbability += transitions[state];
      if (random < cumulativeProbability) {
        return state as GameState;
      }
    }
    
    return 'buildup'; // Default fallback
  } 
  else if (fieldPosition === 'attackingThird') {
    // In attacking third, more dangerous attacks and shots
    const stateTransitionTable: Record<GameState, Record<string, number>> = {
      'attacking': { 'dangerousAttack': 0.7, 'corner': 0.2, 'defending': 0.1 },
      'dangerousAttack': { 'corner': 0.3, 'goalKick': 0.3, 'defending': 0.2, 'attacking': 0.2 },
      // Add other states with appropriate transitions
      'kickoff': { 'attacking': 0.6, 'dangerousAttack': 0.4 },
      'buildup': { 'attacking': 0.8, 'dangerousAttack': 0.2 },
      'defending': { 'counterAttack': 0.5, 'buildup': 0.5 },
      'counterAttack': { 'dangerousAttack': 0.7, 'attacking': 0.3 },
      'setpiece': { 'dangerousAttack': 0.6, 'corner': 0.3, 'defending': 0.1 },
      'goalKick': { 'defending': 1.0 },
      'stoppage': { 'attacking': 0.7, 'setpiece': 0.3 },
      'corner': { 'dangerousAttack': 0.6, 'defending': 0.4 },
      'throwIn': { 'attacking': 0.8, 'dangerousAttack': 0.2 }
    };
    
    const transitions = stateTransitionTable[currentState] || { 'attacking': 1.0 };
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const state in transitions) {
      cumulativeProbability += transitions[state];
      if (random < cumulativeProbability) {
        return state as GameState;
      }
    }
    
    return 'attacking'; // Default fallback
  }
  else {
    // Standard state transition table for midfield positions
    const stateTransitionTable: Record<GameState, Record<string, number>> = {
      'kickoff': { 
        'buildup': 0.95, 
        'counterAttack': 0.05 
      },
      'buildup': { 
        'attacking': 0.65, 
        'defending': 0.15, 
        'buildup': 0.15, 
        'stoppage': 0.05 
      },
      'attacking': { 
        'dangerousAttack': 0.45, 
        'defending': 0.25, 
        'buildup': 0.20, 
        'stoppage': 0.05, 
        'corner': 0.05
      },
      'defending': { 
        'buildup': 0.45, 
        'counterAttack': 0.30, 
        'defending': 0.20, 
        'setpiece': 0.05 
      },
      'dangerousAttack': { 
        'setpiece': 0.20, 
        'goalKick': 0.25, 
        'corner': 0.25,
        'attacking': 0.20, 
        'defending': 0.10 
      },
      'counterAttack': { 
        'dangerousAttack': 0.50, 
        'attacking': 0.30, 
        'defending': 0.15, 
        'stoppage': 0.05 
      },
      'setpiece': { 
        'defending': 0.35, 
        'dangerousAttack': 0.30, 
        'corner': 0.15, 
        'buildup': 0.20
      },
      'goalKick': { 
        'buildup': 0.75, 
        'defending': 0.25 
      },
      'stoppage': { 
        'buildup': 0.70, 
        'setpiece': 0.30 
      },
      'corner': { 
        'dangerousAttack': 0.50,
        'defending': 0.30,
        'goalKick': 0.10,
        'setpiece': 0.10
      },
      'throwIn': {
        'buildup': 0.60,
        'attacking': 0.25,
        'defending': 0.15
      }
    };
    
    const transitions = stateTransitionTable[currentState];
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const state in transitions) {
      cumulativeProbability += transitions[state];
      if (random < cumulativeProbability) {
        return state as GameState;
      }
    }
    
    // Fallback
    return 'buildup';
  }
};

/**
 * Handle special events that require specific state transitions
 */
export const handleEventStateChange = (
  event: { type: string },
  currentState: GameState,
  currentPossession: 'home' | 'away',
  currentFieldPosition: FieldPosition
): { 
  newState: GameState, 
  newPossession: 'home' | 'away', 
  newFieldPosition: FieldPosition 
} => {
  let newState = currentState;
  let newPossession = currentPossession;
  let newFieldPosition = currentFieldPosition;

  if (event.type === 'goal') {
    // Goals always result in kickoff and possession change
    newState = 'kickoff';
    newPossession = currentPossession === 'home' ? 'away' : 'home';
    newFieldPosition = 'midfield';
  } else if (event.type === 'shot') {
    // Shots can only happen in attacking positions
    if (currentFieldPosition !== 'attackingThird' && currentFieldPosition !== 'attackingHalf') {
      // If not in attacking position, keep state but update event type
      // This will be handled by the calling function
    } else {
      // Shot results depend on field position
      const shotOutcome = Math.random();
      if (shotOutcome > 0.7) {
        // Shot results in corner
        newState = 'corner';
        // Possession stays the same for corner
      } else if (shotOutcome > 0.4) {
        // Shot saved or wide - goal kick
        newState = 'goalKick';
        newPossession = currentPossession === 'home' ? 'away' : 'home';
        newFieldPosition = 'defense'; // Reset field position for goal kick
      } else {
        // Shot blocked - play continues
        newState = getNextGameState(currentState, currentFieldPosition, currentPossession);
      }
    }
  } else if (event.type === 'corner') {
    // Corner always leads to set piece with same possession
    newState = 'setpiece';
    newFieldPosition = 'attackingThird';
  } else if (event.type === 'out_of_field') {
    // Ball out ALWAYS leads to throw-in with possession change to opposite team
    newState = 'throwIn';
    newPossession = currentPossession === 'home' ? 'away' : 'home';
    // Field position stays the same for throw-ins
  } else if (event.type === 'throw_in') {
    // Throw-in already has the correct possession, just update state
    newState = 'buildup';
  } else if (event.type === 'foul' || event.type === 'yellow_card' || event.type === 'red_card') {
    // Fouls and cards always lead to set pieces with possession change
    newState = 'setpiece';
    newPossession = currentPossession === 'home' ? 'away' : 'home';
  } else if (event.type === 'injury') {
    // For injury events, usually results in a stoppage
    newState = 'stoppage';
    // Possession might change after an injury stoppage
    if (Math.random() > 0.5) {
      newPossession = currentPossession === 'home' ? 'away' : 'home';
    }
  }

  return { newState, newPossession, newFieldPosition };
};
