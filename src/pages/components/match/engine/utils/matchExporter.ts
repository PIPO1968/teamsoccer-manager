
import { MatchEventData } from "../../types/matchTypes";
import { calculateMatchStats } from "./matchStats";
import { WeatherType } from "./weatherUtils";

/**
 * Export the match data as JSON for external use
 */
export const exportMatchData = (
  eventTimeline: MatchEventData[],
  homeTeamId?: number,
  homeTeamName?: string,
  homeTeamLogo?: string,
  homeScore: number = 0,
  awayTeamId?: number, 
  awayTeamName?: string,
  awayTeamLogo?: string,
  awayScore: number = 0,
  weather?: WeatherType
): string => {
  const matchStats = calculateMatchStats(eventTimeline);
  
  const matchData = {
    homeTeam: {
      id: homeTeamId,
      name: homeTeamName,
      logo: homeTeamLogo,
      score: homeScore
    },
    awayTeam: {
      id: awayTeamId,
      name: awayTeamName,
      logo: awayTeamLogo,
      score: awayScore
    },
    weather: weather,
    events: eventTimeline,
    matchStats
  };
  
  return JSON.stringify(matchData, null, 2);
};
