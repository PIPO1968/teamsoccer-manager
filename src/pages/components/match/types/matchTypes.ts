
export interface MatchEventPosition {
  positions: { id: number; x: number; y: number }[];
}

export interface MatchEventData {
  minute: number;
  type: "goal" | "shot" | "save" | "foul" | "card" | "yellow_card" | "red_card" | "corner" | "possession" | "commentary" | "substitution" | "injury" | "out_of_field" | "throw_in" | "kick_off" | "weather";
  team: "home" | "away";
  player?: string;
  playerId?: number;
  teamId?: number;
  teamName?: string;  
  teamLogo?: string; 
  description: string;
  involvedPlayers?: Array<{
    name: string;
    id: number;
  }>;
  positions?: MatchEventPosition;
  homeScore?: number;
  awayScore?: number;
  weather?: string;  
  weatherIcon?: string; 
  timestamp?: string;
}

// Import the Player type from the main types file to ensure consistency
export type { Player } from '../../types/match';

export interface MatchContext {
  matchTime: number;
  homeScore: number;
  awayScore: number;
  isPlaying: boolean;
  isHalfTime: boolean;
  isFullTime: boolean;
  matchSpeed: number;
  playerPositions?: {[key: number]: {x: number, y: number}};
  matchEvents: MatchEventData[];
  playerPerformances: {[key: string]: number};
  matchRating: number;
  weather?: string;
  setMatchSpeed: (speed: number) => void;
  handlePlayPause: () => void;
  handleSkip: () => void;
  handleRestart: () => void;
}
