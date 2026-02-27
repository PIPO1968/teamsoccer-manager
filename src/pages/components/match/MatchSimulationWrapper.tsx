import React, { useEffect, useState } from 'react';
import { Player, MatchEventData } from './types/matchTypes';
import { useSimulationState } from '../../hooks/simulation/useSimulationState';
import { useMatchStats } from './MatchStatsProvider';
import { toast } from '@/components/ui/use-toast';
import { useTeamData } from '@/hooks/useTeamData';
import { weatherTypes } from './engine/utils/weatherUtils';

interface MatchSimulationWrapperProps {
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeamId?: number;
  awayTeamId?: number;
  children: (simulationProps: {
    isPlaying: boolean;
    matchTime: number;
    homeScore: number;
    awayScore: number;
    isHalfTime: boolean;
    isFullTime: boolean;
    matchSpeed: number;
    matchEvents: MatchEventData[];
    weather?: string;
    playerPositions?: {[key: number]: {x: number, y: number}};
    setIsPlaying: (playing: boolean, speed?: number) => void;
    skipAhead: (minutes: number) => void;
    restartMatch: () => void;
  }) => React.ReactNode;
}

const MatchSimulationWrapper: React.FC<MatchSimulationWrapperProps> = ({
  homePlayers,
  awayPlayers,
  homeTeamId,
  awayTeamId,
  children
}) => {
  const { updateStats, setMatchEvents } = useMatchStats();
  const [matchSpeed, setMatchSpeed] = useState(1);
  const { team: homeTeam } = useTeamData(homeTeamId?.toString());
  const { team: awayTeam } = useTeamData(awayTeamId?.toString());
  const [initialEventAdded, setInitialEventAdded] = useState(false);
  const [weather, setWeather] = useState<string | undefined>(undefined);
  const [currentScores, setCurrentScores] = useState({ homeScore: 0, awayScore: 0 });
  
  const handleMatchEvent = (event: MatchEventData) => {
    console.log("Match event:", event);
    
    // Add team names and logos to the event if not already present
    const homeTeamName = homeTeam?.name || "Home Team";
    const awayTeamName = awayTeam?.name || "Away Team";
    
    const enhancedEvent = {
      ...event,
      teamName: event.teamName || (event.team === "home" ? homeTeamName : awayTeamName),
      teamLogo: event.teamLogo || (event.team === "home" ? homeTeam?.club_logo : awayTeam?.club_logo)
    };
    
    // Replace generic "Home Team" and "Away Team" with actual team names in description
    if (enhancedEvent.description) {
      enhancedEvent.description = enhancedEvent.description
        .replace(/Home Team/g, homeTeamName)
        .replace(/Away Team/g, awayTeamName);
    }
    
    // Update scores when we have score data in the event
    if (typeof event.homeScore === 'number' && typeof event.awayScore === 'number') {
      console.log("Updating scores from event:", { homeScore: event.homeScore, awayScore: event.awayScore });
      setCurrentScores({
        homeScore: event.homeScore,
        awayScore: event.awayScore
      });
    }
    
    // Track weather from weather events
    if (event.type === "weather" && event.weather) {
      setWeather(event.weather);
      
      // Show weather toast when first detected
      setTimeout(() => {
        const weatherInfo = weatherTypes[event.weather as keyof typeof weatherTypes];
        if (weatherInfo) {
          toast({
            title: `Match Weather: ${weatherInfo.name}`,
            description: weatherInfo.description,
          });
        }
      }, 500);
    }
    
    setMatchEvents(prev => [...prev, enhancedEvent]);
    
    if (event.type === "goal") {
      updateStats("goal", event.team);
      setTimeout(() => {
        toast({
          title: "GOAL!",
          description: `${enhancedEvent.teamName} scores!`,
          variant: "default",
        });
      }, 0);
    } else if (event.type === "shot") {
      updateStats("shot", event.team);
    } else if (event.type === "corner") {
      updateStats("corner", event.team);
    } else if (event.type === "foul") {
      updateStats("foul", event.team);
    } else if (event.type === "yellow_card") {
      updateStats("yellow_card", event.team);
    } else if (event.type === "red_card") {
      updateStats("red_card", event.team);
    }
  };
  
  const simulation = useSimulationState({
    homePlayers,
    awayPlayers,
    homeTeamId,
    awayTeamId,
    homeTeamName: homeTeam?.name,
    awayTeamName: awayTeam?.name,
    homeTeamLogo: homeTeam?.club_logo,
    awayTeamLogo: awayTeam?.club_logo,
    matchSpeed,
    onMatchEvent: handleMatchEvent
  });

  // Add debugging logs to track isPlaying state changes and match events
  useEffect(() => {
    console.log("MatchSimulationWrapper - isPlaying changed to:", simulation.isPlaying);
    console.log("Current match events:", simulation.matchEvents);
    console.log("Teams:", { home: homeTeam?.name, away: awayTeam?.name });
    console.log("Current scores in wrapper:", currentScores);
    
    // Add initial event when play is first pressed
    if (simulation.isPlaying && !initialEventAdded) {
      const initialEvent: MatchEventData = {
        minute: 0,
        type: "commentary",
        team: "home",
        description: "The match begins!",
        teamName: homeTeam?.name || "Home Team",
        teamLogo: homeTeam?.club_logo,
        homeScore: 0,
        awayScore: 0
      };
      handleMatchEvent(initialEvent);
      setInitialEventAdded(true);
    }
    
    // Reset initialEventAdded when match is restarted
    if (!simulation.isPlaying && simulation.matchTime === 0) {
      setInitialEventAdded(false);
      setWeather(undefined);
      setCurrentScores({ homeScore: 0, awayScore: 0 });
    }
  }, [simulation.isPlaying, simulation.matchEvents, simulation.matchTime, initialEventAdded, homeTeam, awayTeam, currentScores]);

  // Create a wrapper setIsPlaying function that can also set speed
  const setIsPlaying = (playing: boolean, speed?: number) => {
    if (speed !== undefined && speed !== matchSpeed) {
      setMatchSpeed(speed);
    }
    simulation.setIsPlaying(playing);
  };

  // Handle speed changes with new multipliers: 1x, 4x, 8x, 16x
  const handleSpeedUp = () => {
    const speedValues = [1, 4, 8, 16];
    const currentIndex = speedValues.indexOf(matchSpeed);
    if (currentIndex < speedValues.length - 1) {
      const newSpeed = speedValues[currentIndex + 1];
      setMatchSpeed(newSpeed);
      toast({
        title: "Speed Increased",
        description: `Match speed set to ${newSpeed}x`,
        duration: 2000,
      });
    }
  };

  const handleSpeedDown = () => {
    const speedValues = [1, 4, 8, 16];
    const currentIndex = speedValues.indexOf(matchSpeed);
    if (currentIndex > 0) {
      const newSpeed = speedValues[currentIndex - 1];
      setMatchSpeed(newSpeed);
      toast({
        title: "Speed Decreased",
        description: `Match speed set to ${newSpeed}x`,
        duration: 2000,
      });
    }
  };

  return (
    <>
      {children({
        isPlaying: simulation.isPlaying,
        matchTime: simulation.matchTime,
        homeScore: currentScores.homeScore,
        awayScore: currentScores.awayScore,
        isHalfTime: simulation.isHalfTime,
        isFullTime: simulation.isFullTime,
        matchSpeed,
        matchEvents: simulation.matchEvents,
        weather,
        playerPositions: simulation.playerPositions,
        setIsPlaying,
        skipAhead: simulation.skipAhead,
        restartMatch: simulation.restartMatch
      })}
    </>
  );
};

export default MatchSimulationWrapper;
