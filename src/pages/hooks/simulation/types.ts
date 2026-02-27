
import { MatchEventData } from "../../components/types/matchTypes";

export interface SimulationState {
  isPlaying: boolean;
  matchTime: number;
  homeScore: number;
  awayScore: number;
  currentEventIndex: number;
  playerPositions: {[key: number]: {x: number, y: number}};
}

export interface SimulationOptions {
  matchSpeed: number;
  onMatchEvent?: (event: MatchEventData) => void;
}

export interface PlayerMovement {
  id: number;
  x: number;
  y: number;
}

export interface MovementQueue {
  [key: number]: Array<{x: number, y: number}>;
}
