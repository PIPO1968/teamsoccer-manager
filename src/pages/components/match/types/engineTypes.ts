
import { MatchEventData } from "../../types/matchTypes";
import { Player } from "../../../components/types/match";

/**
 * Types for the Match Simulation Engine
 */
export interface MatchEventGeneratorOptions {
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

export interface EventGenerator {
  type: string;
  generate: (
    minute: number, 
    team: 'home' | 'away', 
    player: Player | undefined,
    options?: MatchEventGeneratorOptions
  ) => MatchEventData;
}

// Game state for the probabilistic state machine
export type GameState = 
  | 'kickoff'
  | 'buildup'
  | 'attacking'
  | 'defending'
  | 'dangerousAttack'
  | 'counterAttack'
  | 'setpiece'
  | 'goalKick'
  | 'stoppage'
  | 'corner'
  | 'throwIn'; // Added throwIn as a valid game state

// Event probabilities based on game state and team/player attributes
export interface EventProbabilities {
  goal: number;
  shot: number;
  save: number;
  pass: number;
  dribble: number;
  tackle: number;
  corner: number;
  foul: number;
  yellowCard: number;
  redCard: number;
  injury: number;
  outOfField: number;
  throwIn: number;
}

// Game context that tracks the current state and possession
export interface GameContext {
  state: GameState;
  possession: 'home' | 'away';
  lastAction: string;
  ballPosition: 'defense' | 'midfield' | 'attack';
  intensity: number; // 1-10, affects foul/card probabilities
  minute: number;
}

// Player attribute contribution to event probabilities
export interface PlayerAttributes {
  passing: number;
  shooting: number;
  tackling: number;
  aggression: number;
  stamina: number;
  injuryProne: number;
}

// Match simulation settings
export interface MatchSimulationSettings {
  eventDensity: number; // How many events per match (approximate)
  homeAdvantage: number; // Boost to home team probabilities
  intensityProgression: number; // How intensity increases over time
  stateTransitionTable: Record<GameState, Record<string, number>>; // Probability to transition between states
}
