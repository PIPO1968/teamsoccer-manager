
import { useEffect } from 'react';
import { Player } from '../components/types/match';

interface UsePlayerEnergyProps {
  isPlaying: boolean;
  matchSpeed: number;
  setHomePlayers: (fn: (prev: Player[]) => Player[]) => void;
  setAwayPlayers: (fn: (prev: Player[]) => Player[]) => void;
}

export const usePlayerEnergy = ({
  isPlaying,
  matchSpeed,
  setHomePlayers,
  setAwayPlayers
}: UsePlayerEnergyProps) => {
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setHomePlayers(prev => prev.map(player => ({
        ...player,
        energy: Math.max(60, player.energy - (Math.random() * 0.1 * matchSpeed))
      })));
      
      setAwayPlayers(prev => prev.map(player => ({
        ...player,
        energy: Math.max(60, player.energy - (Math.random() * 0.1 * matchSpeed))
      })));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, matchSpeed, setHomePlayers, setAwayPlayers]);
};
