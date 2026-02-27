
import { createContext, useContext } from 'react';
import { MatchEventData } from './types/matchTypes';

interface MatchContextType {
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

export const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const useMatchContext = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatchContext must be used within a MatchProvider');
  }
  return context;
};
