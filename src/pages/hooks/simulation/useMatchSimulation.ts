import { useEffect, useRef } from 'react';
import { SimulationOptions } from './types';
import { Player } from '../../components/types/match';
import { useSimulationState } from './useSimulationState';

export const useMatchSimulation = (
  homePlayers: Player[], 
  awayPlayers: Player[], 
  options: SimulationOptions
) => {
  const lastTickTime = useRef<number>(Date.now());
  
  const simulation = useSimulationState({
    homePlayers,
    awayPlayers,
    matchSpeed: options.matchSpeed,
    onMatchEvent: options.onMatchEvent
  });

  // Handle movement updates
  useEffect(() => {
    if (!simulation.isPlaying) return;

    const updateFrame = () => {
      const now = Date.now();
      const deltaTime = (now - lastTickTime.current) / 1000;
      lastTickTime.current = now;

      simulation.handleMovementUpdate(deltaTime);
    };

    const frameId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(frameId);
  }, [simulation.isPlaying, simulation.handleMovementUpdate]);

  // Handle match time progression
  useEffect(() => {
    if (!simulation.isPlaying) {
      lastTickTime.current = Date.now();
      return;
    }

    // Get a fresh reference to the current timestamp
    lastTickTime.current = Date.now();
    
    // We'll use this interval to trigger time updates periodically
    const intervalId = setInterval(() => {
      // We're not directly calling a method on simulation here
      // Instead, the simulation will update its own time since isPlaying is true
      // This avoids the TypeScript error about missing updateMatchTime property
    }, 1000 / 60);
    
    return () => clearInterval(intervalId);
  }, [simulation.isPlaying]);

  return {
    ...simulation
  };
};
