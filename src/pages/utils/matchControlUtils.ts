
import { toast } from "@/components/ui/use-toast";
import { Player } from "../components/types/match";

export const handleSpeedChange = (
  currentSpeed: number, 
  direction: 'up' | 'down',
  setMatchSpeed: (speed: number) => void
) => {
  const newSpeed = direction === 'up' 
    ? Math.min(currentSpeed + 1, 3)
    : Math.max(currentSpeed - 1, 1);
  
  setMatchSpeed(newSpeed);
  toast({
    title: `Match Speed ${direction === 'up' ? 'Increased' : 'Decreased'}`,
    description: `Match speed set to ${newSpeed}x`,
    duration: 2000,
  });
};

export const handlePlayPauseToggle = (
  isPlaying: boolean,
  setIsPlaying: (playing: boolean) => void
) => {
  setIsPlaying(!isPlaying);
  toast({
    title: isPlaying ? "Match Paused" : "Match Started",
    description: isPlaying ? 
      "The match simulation has been paused." : 
      "The match simulation is now running.",
    duration: 2000,
  });
};

export const resetPlayersEnergy = (players: Player[]): Player[] => {
  return players.map(player => ({
    ...player,
    energy: 90 + Math.floor(Math.random() * 10),
    isInjured: false
  }));
};
