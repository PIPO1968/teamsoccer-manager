
import { MatchEventData } from "../../types/matchTypes";
import { Player } from "../../../../components/types/match";
import { GameState, MatchEventGeneratorOptions } from "../types/engineTypes";
import { eventGenerators, getRandomEventGenerator } from "./eventGenerators";
import { selectPlayerForAction } from "../utils/playerSelector";
import { getFieldPosition } from "../utils/fieldPositionHandler";
import { getNextGameState, handleEventStateChange } from "../utils/gameStateManager";

// Generate events for a specific minute
export const generateMinuteEvents = (
  minute: number,
  initialState: GameState,
  initialPossession: 'home' | 'away',
  homePlayers: Player[],
  awayPlayers: Player[],
  options?: MatchEventGeneratorOptions,
  maxEvents: number = 1
): { events: MatchEventData[], finalState: GameState, finalPossession: 'home' | 'away' } => {
  let currentState = initialState;
  let currentPossession = initialPossession;
  let currentFieldPosition = getFieldPosition(currentState, 'midfield'); // Default start position
  let lastAction = '';
  const events: MatchEventData[] = [];
  
  // Intensity increases as the match progresses, 1-10 scale
  const intensity = 1 + Math.floor((minute / 90) * 8) + 
                   (minute >= 85 ? 2 : 0) + 
                   (minute >= 40 && minute <= 45 ? 1 : 0);

  // Handle kick-off events specifically - only at minute 1 and 46
  if (minute === 1) {
    // First half kick-off - always by home team
    const homePlayer = selectPlayerForAction(homePlayers, 'kickoff');
    events.push(eventGenerators.kick_off.generate(minute, 'home', homePlayer, options));
    currentState = 'buildup';
    currentPossession = 'home';
    currentFieldPosition = 'midfield';
    lastAction = 'kick_off';
    
    // Only return kick-off for minute 1
    return {
      events,
      finalState: currentState,
      finalPossession: currentPossession
    };
  }
  
  if (minute === 46) {
    // Second half kick-off - always by away team
    const awayPlayer = selectPlayerForAction(awayPlayers, 'kickoff');
    events.push(eventGenerators.kick_off.generate(minute, 'away', awayPlayer, options));
    currentState = 'buildup';
    currentPossession = 'away';
    currentFieldPosition = 'midfield';
    lastAction = 'kick_off';
    
    // Only return kick-off for minute 46
    return {
      events,
      finalState: currentState,
      finalPossession: currentPossession
    };
  }
  
  // Update field position based on current state
  currentFieldPosition = getFieldPosition(currentState, currentFieldPosition);
  
  for (let i = 0; i < maxEvents; i++) {
    // Select a player from the team in possession
    const players = currentPossession === 'home' ? homePlayers : awayPlayers;
    const player = selectPlayerForAction(players, currentState);
    
    // Get an event generator based on the current state and field position
    const eventGenerator = getRandomEventGenerator(currentState, currentFieldPosition);
    
    // Generate the event
    const event = eventGenerator.generate(minute, currentPossession, player, options);
    events.push(event);
    
    lastAction = event.type;
    
    // Handle state changes based on the event
    const { newState, newPossession, newFieldPosition } = handleEventStateChange(
      event, 
      currentState, 
      currentPossession, 
      currentFieldPosition
    );
    
    // Update state and possession based on the event and ensure logical flow
    currentState = newState;
    currentPossession = newPossession;
    currentFieldPosition = newFieldPosition;
    
    // Special case for shots in non-attacking positions
    if (event.type === 'shot') {
      if (currentFieldPosition !== 'attackingThird' && currentFieldPosition !== 'attackingHalf') {
        // If not in attacking position, convert to a pass instead
        event.type = 'possession';
        event.description = `${player ? `${player.firstName} ${player.lastName}` : 'Player'} passes the ball forward.`;
      }
    } else {
      // For other events, get next state based on the specific event type
      // Only pass recognized event types to getNextGameState
      let nextStateEventType: string | undefined = event.type;
      
      if (!['goal', 'shot', 'corner', 'foul', 'yellow_card', 'red_card', 'possession', 'dribble', 'tackle', 'out_of_field', 'throw_in'].includes(nextStateEventType)) {
        nextStateEventType = undefined;
      }
      
      // Update state based on the event type and current conditions
      currentState = getNextGameState(currentState, currentFieldPosition, currentPossession, nextStateEventType);
      
      // Update field position based on new state
      currentFieldPosition = getFieldPosition(currentState, currentFieldPosition);
      
      // Random chance of possession change on some events (like losing the ball)
      if ((event.type === 'possession' && Math.random() > 0.85) || Math.random() > 0.9) {
        currentPossession = currentPossession === 'home' ? 'away' : 'home';
        
        // When possession changes unexpectedly, often leads to build up or counter
        if (Math.random() > 0.7) {
          currentState = 'counterAttack';
        } else {
          currentState = 'buildup';
        }
        
        // Update field position after possession change
        currentFieldPosition = getFieldPosition(currentState, currentFieldPosition);
      }
    }
  }
  
  return {
    events,
    finalState: currentState,
    finalPossession: currentPossession
  };
};
