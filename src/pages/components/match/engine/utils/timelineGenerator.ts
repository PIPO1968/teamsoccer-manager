import { Player } from "../../../../components/types/match";
import { MatchEventData } from "../../types/matchTypes";
import { MatchEventGeneratorOptions, GameState } from "../types/engineTypes";
import { generateKeyMinutes } from "./timeUtils";
import { 
  generateInitialEvent, 
  generateHalfTimeEvent, 
  generateSecondHalfEvent, 
  generateFullTimeEvent 
} from "../generators/matchMomentGenerators";
import { generateMinuteEvents } from "../generators/attackSequenceGenerator";
import { getWeatherCommentary } from "./weatherUtils";

/**
 * Generate a complete match timeline of events
 */
export const generateMatchTimeline = (
  homePlayers: Player[],
  awayPlayers: Player[],
  options: MatchEventGeneratorOptions
): {
  eventTimeline: MatchEventData[],
  homeScore: number,
  awayScore: number
} => {
  const eventTimeline: MatchEventData[] = [];
  let homeScore = 0;
  let awayScore = 0;
  
  // Game state variables for the state machine
  let gameState: GameState = 'kickoff';
  let possession: 'home' | 'away' = 'home';  // Always start with home possession for first half
  let intensity: number = 1;  // 1-10 scale, increases as match progresses
  
  // Start event - home team kick-off will be generated in minute 1
  eventTimeline.push(generateInitialEvent(homePlayers, awayPlayers, options));
  
  // Add weather commentary at the start of the match
  if (options.weather) {
    eventTimeline.push({
      minute: 0,
      type: "weather",
      team: "home", // weather is neutral but we need a value
      description: getWeatherCommentary(options.weather),
      weather: options.weather
    });
  }
  
  // Generate random key match moments for the first half (5 key moments spread throughout)
  const firstHalfKeyMinutes = generateKeyMinutes(5, 42, 5);
  
  // Generate minute-by-minute events for the first half
  for (let minute = 1; minute <= 45; minute++) {
    // Update match intensity based on the minute
    intensity = updateMatchIntensity(minute, intensity);
    
    // Force events at key minutes to ensure distribution
    const eventsPerMinute = firstHalfKeyMinutes.includes(minute) ? 1 : getEventsPerMinute(minute, gameState);
    
    if (eventsPerMinute > 0 || minute === 1) { // Ensure minute 1 always generates the kick-off event
      const { events, finalState, finalPossession } = generateMinuteEvents(
        minute,
        gameState,
        possession,
        homePlayers,
        awayPlayers,
        options,
        minute === 1 ? 1 : eventsPerMinute // Specific handling for minute 1 (kick-off)
      );
      
      // Update game state for the next minute
      gameState = finalState;
      possession = finalPossession;
      
      // Add events to the timeline and track goals
      for (const event of events) {
        if (event.type === "goal") {
          if (event.team === "home") {
            homeScore++;
          } else {
            awayScore++;
          }
        }
        eventTimeline.push(event);
      }
    }
  }
  
  // Half time
  eventTimeline.push(generateHalfTimeEvent(options));
  
  // Reset game state for second half but keep the score
  gameState = 'kickoff';
  possession = 'away'; // Always start with away possession for second half
  intensity = 2; // Start the second half with slightly higher intensity
  
  // Second half begins - away team kick-off generated in minute 46
  eventTimeline.push(generateSecondHalfEvent(homePlayers, awayPlayers, options));
  
  // Generate random key match moments for the second half
  const secondHalfKeyMinutes = generateKeyMinutes(50, 87, 5);
  
  // Generate minute-by-minute events for the second half
  for (let minute = 46; minute <= 90; minute++) {
    // Update match intensity based on the minute
    intensity = updateMatchIntensity(minute, intensity);
    
    // Force events at key minutes to ensure distribution
    const eventsPerMinute = secondHalfKeyMinutes.includes(minute) ? 1 : getEventsPerMinute(minute, gameState);
    
    if (eventsPerMinute > 0 || minute === 46) { // Ensure minute 46 always generates the kick-off event
      const { events, finalState, finalPossession } = generateMinuteEvents(
        minute,
        gameState,
        possession,
        homePlayers,
        awayPlayers,
        options,
        minute === 46 ? 1 : eventsPerMinute // Specific handling for minute 46 (kick-off)
      );
      
      // Update game state for the next minute
      gameState = finalState;
      possession = finalPossession;
      
      // Add events to the timeline and track goals
      for (const event of events) {
        if (event.type === "goal") {
          if (event.team === "home") {
            homeScore++;
          } else {
            awayScore++;
          }
        }
        eventTimeline.push(event);
      }
    }
  }
  
  // Full time
  eventTimeline.push(generateFullTimeEvent(options));
  
  return { eventTimeline, homeScore, awayScore };
};

/**
 * Calculate the number of events to generate for this minute
 * based on match excitement and current game state
 */
const getEventsPerMinute = (minute: number, gameState: GameState): number => {
  // Reduced base events per minute - most minutes will have 0 events
  if (Math.random() > 0.3) {
    return 0;
  }
  
  // Base events per minute (much lower than before)
  let eventsPerMinute = 1;
  
  // More events only in very exciting states, and less frequently
  if ((gameState === 'dangerousAttack' || gameState === 'counterAttack') && Math.random() > 0.7) {
    eventsPerMinute += 1;
  }
  
  // More events in particularly important match moments only
  if ((minute === 1 || minute === 46 || minute >= 88 || minute === 45) && Math.random() > 0.5) {
    eventsPerMinute += 1;
  }
  
  // Cap max events per minute
  return Math.min(eventsPerMinute, 2);
};

/**
 * Update the intensity of the match based on the minute
 */
const updateMatchIntensity = (minute: number, currentIntensity: number): number => {
  let intensity = currentIntensity;
  
  // Intensity slowly increases throughout the match
  intensity = 1 + Math.floor((minute / 90) * 4);
  
  // Extra intensity at the end of each half
  if (minute >= 42 && minute <= 45) {
    intensity += 1;
  } else if (minute >= 85) {
    intensity += 2;
  }
  
  // Cap intensity
  return Math.max(1, Math.min(10, intensity));
};

/**
 * Add timestamp metadata to events for more realistic timing
 */
export const addTimestampsToEvents = (events: MatchEventData[]): MatchEventData[] => {
  let baseTimestamp = Date.now() - 90 * 60 * 1000; // 90 minutes ago
  
  return events.map(event => {
    // Convert minute to milliseconds (each minute = 60 seconds)
    const eventTime = baseTimestamp + (event.minute * 60 * 1000);
    
    // Add a timestamp property for use in display logic
    return {
      ...event,
      timestamp: new Date(eventTime).toISOString()
    };
  });
};
