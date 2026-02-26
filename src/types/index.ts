export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CDM' | 'CAM' | 'LW' | 'RW' | 'ST' | 'CF';

export interface Player {
  id: number;
  name: string;
  position: Position;
  age: number;
  overall: number;
  speed: number;
  shooting: number;
  passing: number;
  defending: number;
  energy: number;
  salary: number;
  value: number;
  goals: number;
  assists: number;
  inSquad: boolean;
}

export interface Formation {
  name: string;
  positions: { position: Position; x: number; y: number }[];
}

export type MatchResult = 'W' | 'D' | 'L';

export interface Match {
  id: number;
  opponent: string;
  homeGoals: number;
  awayGoals: number;
  isHome: boolean;
  date: string;
  played: boolean;
}

export interface TeamStats {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface GameState {
  teamName: string;
  budget: number;
  week: number;
  players: Player[];
  matches: Match[];
  leagueTable: TeamStats[];
}
