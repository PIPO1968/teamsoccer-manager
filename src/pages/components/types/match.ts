
import { PlayerData } from '@/hooks/useTeamPlayers';

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  position: string;
  x: number;
  y: number;
  isCaptain?: boolean;
  isInjured?: boolean;
  form: string;
  energy: number;
  rating: number;
  finishing: number;
  passing: number;
  dribbling: number;
  defense: number;
  fitness: number;
  playerData?: PlayerData; // Optional reference to original PlayerData
}

export interface MatchEventData {
  minute: number;
  type: string;
  team: string;
  description: string;
  playerId?: number;
  playerName?: string;
  teamName?: string;
  teamLogo?: string;
  homeScore?: number;
  awayScore?: number;
  weather?: string;
}
