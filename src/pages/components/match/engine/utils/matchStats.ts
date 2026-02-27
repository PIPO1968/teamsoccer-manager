
import { MatchEventData } from "../../types/matchTypes";

/**
 * Update scores based on goal events
 * @param events List of match events
 * @returns Object containing home and away scores
 */
export const calculateScores = (events: MatchEventData[]): { homeScore: number, awayScore: number } => {
  let homeScore = 0;
  let awayScore = 0;
  
  events.forEach(event => {
    if (event.type === "goal") {
      if (event.team === "home") {
        homeScore++;
      } else {
        awayScore++;
      }
    }
  });
  
  return { homeScore, awayScore };
};

/**
 * Update all events with the current score
 * @param events List of match events to update
 */
export const updateScoresInEvents = (events: MatchEventData[]): MatchEventData[] => {
  let currentHomeScore = 0;
  let currentAwayScore = 0;
  
  return events.map(event => {
    // For goal events, we update the score after the goal is scored
    if (event.type === "goal") {
      if (event.team === "home") {
        currentHomeScore++;
      } else {
        currentAwayScore++;
      }
      return {
        ...event,
        homeScore: currentHomeScore,
        awayScore: currentAwayScore
      };
    } else {
      // For other events, we set the current score
      return {
        ...event,
        homeScore: currentHomeScore,
        awayScore: currentAwayScore
      };
    }
  });
};

/**
 * Calculate match statistics from events
 */
export const calculateMatchStats = (events: MatchEventData[]) => {
  const stats = {
    possession: { home: 0, away: 0 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 }
  };
  
  // Calculate match stats from events
  events.forEach(event => {
    if (event.team === 'home') {
      if (event.type === 'shot') stats.shots.home++;
      if (event.type === 'goal') {
        stats.shots.home++;
        stats.shotsOnTarget.home++;
      }
      if (event.type === 'corner') stats.corners.home++;
      if (event.type === 'foul') stats.fouls.home++;
      if (event.type === 'yellow_card') stats.yellowCards.home++;
      if (event.type === 'red_card') stats.redCards.home++;
    } else if (event.team === 'away') {
      if (event.type === 'shot') stats.shots.away++;
      if (event.type === 'goal') {
        stats.shots.away++;
        stats.shotsOnTarget.away++;
      }
      if (event.type === 'corner') stats.corners.away++;
      if (event.type === 'foul') stats.fouls.away++;
      if (event.type === 'yellow_card') stats.yellowCards.away++;
      if (event.type === 'red_card') stats.redCards.away++;
    }
  });
  
  // Estimate possession based on number of events for each team
  const homeEvents = events.filter(e => e.team === 'home').length;
  const awayEvents = events.filter(e => e.team === 'away').length;
  const totalEvents = homeEvents + awayEvents;
  
  if (totalEvents > 0) {
    stats.possession.home = Math.round((homeEvents / totalEvents) * 100);
    stats.possession.away = 100 - stats.possession.home;
  } else {
    stats.possession.home = 50;
    stats.possession.away = 50;
  }
  
  return stats;
};
