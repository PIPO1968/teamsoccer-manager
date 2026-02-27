
import { MatchEventData, MatchEventPosition } from './types/matchTypes';
import { generateAttackSequence, generateInjuryEvent } from './match/utils/eventSequenceGenerator';

const generateEventTimes = () => {
  const times: number[] = [];
  const eventCount = 15 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < eventCount; i++) {
    times.push(Math.floor(Math.random() * 90) + 1);
  }
  
  return times.sort((a, b) => a - b);
};

export const generateMatchTimeline = (homePlayers: any[], awayPlayers: any[]): MatchEventData[] => {
  if (!homePlayers?.length || !awayPlayers?.length) {
    console.error("Missing player data for match simulation");
    return [];
  }

  const timeline: MatchEventData[] = [];
  
  timeline.push({
    minute: 0,
    type: "commentary",
    team: "home",
    description: "The match begins!",
    positions: {
      positions: [
        ...homePlayers.map(p => ({ id: p.id, x: p.x, y: p.y })),
        ...awayPlayers.map(p => ({ id: p.id, x: p.x, y: p.y }))
      ]
    }
  });
  
  const eventTimes = generateEventTimes();
  
  // Generate match sequences
  timeline.push(...generateAttackSequence(12, "home", homePlayers, awayPlayers));
  timeline.push(...generateAttackSequence(24, "away", homePlayers, awayPlayers));
  timeline.push(...generateAttackSequence(38, "home", homePlayers, awayPlayers, undefined, true));
  
  timeline.push({
    minute: 45,
    type: "commentary",
    team: "home",
    description: "The referee blows the whistle for half time."
  });
  
  timeline.push({
    minute: 46,
    type: "commentary",
    team: "home",
    description: "The second half begins!",
    positions: {
      positions: [
        ...homePlayers.map(p => ({ id: p.id, x: p.x, y: p.y })),
        ...awayPlayers.map(p => ({ id: p.id, x: p.x, y: p.y }))
      ]
    }
  });
  
  timeline.push(...generateAttackSequence(58, "away", homePlayers, awayPlayers, undefined, true));
  timeline.push(generateInjuryEvent(67, Math.random() > 0.5 ? "home" : "away", homePlayers, awayPlayers));
  timeline.push(...generateAttackSequence(78, "home", homePlayers, awayPlayers, undefined, true));
  timeline.push(...generateAttackSequence(88, Math.random() > 0.5 ? "home" : "away", homePlayers, awayPlayers));
  
  timeline.push({
    minute: 90,
    type: "commentary",
    team: "home",
    description: "The referee blows the whistle for full time."
  });
  
  // Calculate and update scores
  let homeScore = 0;
  let awayScore = 0;
  
  return timeline.map(event => {
    if (event.type === "goal") {
      if (event.team === "home") {
        homeScore++;
      } else {
        awayScore++;
      }
    }
    
    return {
      ...event,
      homeScore,
      awayScore
    };
  });
};

// Explicitly export the MatchEventData interface
export type { MatchEventData, MatchEventPosition };
