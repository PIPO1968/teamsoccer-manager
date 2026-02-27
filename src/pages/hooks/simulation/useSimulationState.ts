
import { useState, useCallback, useEffect, useRef } from 'react';
import { Player } from '../../components/types/match';
import { useMovementSystem } from './useMovementSystem';
import { useMatchTime } from './useMatchTime';
import { MatchEventData } from '../../components/match/types/matchTypes';
import { MatchSimulationEngine } from '../../components/match/engine/MatchSimulationEngine';

interface UseSimulationStateProps {
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  matchSpeed: number;
  onMatchEvent?: (event: MatchEventData) => void;
}

export const useSimulationState = ({
  homePlayers,
  awayPlayers,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo,
  matchSpeed,
  onMatchEvent
}: UseSimulationStateProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchTimeline, setMatchTimeline] = useState<MatchEventData[]>([]);
  const [isHalfTime, setIsHalfTime] = useState(false);
  const [isFullTime, setIsFullTime] = useState(false);
  const simulationEngineRef = useRef<MatchSimulationEngine | null>(null);

  // Initialize the simulation engine when players data is available
  useEffect(() => {
    if (homePlayers.length > 0 && awayPlayers.length > 0) {
      const engine = new MatchSimulationEngine(
        homePlayers, 
        awayPlayers, 
        homeTeamId, 
        awayTeamId,
        homeTeamName,
        awayTeamName,
        homeTeamLogo,
        awayTeamLogo
      );
      const timeline = engine.getTimeline();
      simulationEngineRef.current = engine;
      setMatchTimeline(timeline);
      console.log("Simulation engine initialized with timeline:", timeline);
    }
  }, [homePlayers, awayPlayers, homeTeamId, awayTeamId, homeTeamName, awayTeamName, homeTeamLogo, awayTeamLogo]);

  const { initializePositions, updatePositions, queueMovements } = useMovementSystem();
  const {
    matchTime,
    currentEventIndex,
    homeScore,
    awayScore,
    updateMatchTime,
    skipAhead,
    resetTime
  } = useMatchTime({
    matchSpeed,
    onMatchEvent,
    matchTimeline
  });

  const [playerPositions, setPlayerPositions] = useState(() => 
    initializePositions(homePlayers, awayPlayers)
  );

  // Use a proper 1-second interval for match time progression
  useEffect(() => {
    if (!isPlaying) return;
    
    // Use setInterval with exactly 1000ms to ensure real-time progression
    const intervalId = setInterval(() => {
      updateMatchTime(true);
      
      // Check if match should pause at half time or full time
      if (Math.floor(matchTime) === 45 && !isHalfTime) {
        setIsPlaying(false);
        setIsHalfTime(true);
        return;
      } else if (Math.floor(matchTime) >= 90 && !isFullTime) {
        setIsPlaying(false);
        setIsFullTime(true);
        return;
      }
    }, 1000); // Exactly 1 second intervals
    
    return () => clearInterval(intervalId);
  }, [isPlaying, matchTime, isHalfTime, isFullTime, updateMatchTime]);

  const handleMovementUpdate = useCallback((deltaTime: number) => {
    if (!isPlaying) return;

    const { updatedPositions, positionsChanged } = updatePositions(
      playerPositions,
      deltaTime,
      matchSpeed
    );

    if (positionsChanged) {
      setPlayerPositions(updatedPositions);
    }
  }, [isPlaying, matchSpeed, playerPositions, updatePositions]);

  const restartMatch = useCallback(() => {
    const initialPositions = initializePositions(homePlayers, awayPlayers);
    setPlayerPositions(initialPositions);
    setIsPlaying(false);
    setIsHalfTime(false);
    setIsFullTime(false);
    resetTime();
    
    // Regenerate match timeline using the engine
    if (simulationEngineRef.current) {
      const newTimeline = simulationEngineRef.current.regenerateTimeline();
      setMatchTimeline(newTimeline);
      console.log("Match timeline regenerated on restart:", newTimeline);
    }
  }, [homePlayers, awayPlayers, initializePositions, resetTime]);

  return {
    isPlaying,
    setIsPlaying,
    matchTime,
    homeScore,
    awayScore,
    currentEventIndex,
    playerPositions,
    isHalfTime,
    isFullTime,
    matchEvents: matchTimeline.slice(0, currentEventIndex + 1),
    handleMovementUpdate,
    skipAhead,
    restartMatch,
    queueMovements,
    setMatchTimeline
  };
};
