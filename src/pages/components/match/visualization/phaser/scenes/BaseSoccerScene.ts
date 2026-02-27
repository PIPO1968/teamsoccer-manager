
import Phaser from 'phaser';
import { Player } from '../../../../../components/types/match';
import { MatchEventData } from '../../../types/matchTypes';
import { MovementEstimator } from '../utils/MovementEstimator';

export interface MatchState {
  matchTime: number;
  homeScore: number;
  awayScore: number;
  isPlaying: boolean;
  matchEvents: MatchEventData[];
  playerPositions?: {[key: number]: {x: number, y: number}};
  weather: string;
  currentEventIndex: number;
  simulationSpeed?: number;
  showDebugGrid?: boolean;
  showPlayerPaths?: boolean;
}

export class BaseSoccerScene extends Phaser.Scene {
  // Field dimensions
  protected fieldWidth!: number;
  protected fieldHeight!: number;
  protected fieldX!: number;
  protected fieldY!: number;
  
  // Game elements
  protected field!: Phaser.GameObjects.Graphics;
  protected ball!: Phaser.GameObjects.Arc;
  protected ballTrail!: Phaser.GameObjects.Graphics;
  protected scoreText!: Phaser.GameObjects.Text;
  protected timeText!: Phaser.GameObjects.Text;
  protected weatherEffects!: Phaser.GameObjects.Container;
  
  // Match data
  protected homePlayers: Player[] = [];
  protected awayPlayers: Player[] = [];
  protected playerSprites: {[key: number]: Phaser.GameObjects.Container} = {};
  protected homeTeamColor: string = '#3b82f6';
  protected awayTeamColor: string = '#ef4444';
  protected weather: string = 'sunny';
  protected onPlayerClick?: (playerId: number) => void;
  protected lastAnimationTimestamp: number = 0;
  protected currentMatchState: MatchState = {
    matchTime: 0,
    homeScore: 0,
    awayScore: 0,
    isPlaying: false,
    matchEvents: [],
    weather: 'sunny',
    currentEventIndex: 0
  };
  
  // Movement system
  protected movementEstimator!: MovementEstimator;
  protected simulationSpeed: number = 0.25;
  protected lastUpdateTime: number = 0;
  
  // Debug graphics for visualizing the grid and paths
  protected debugGraphics!: Phaser.GameObjects.Graphics;
  protected showDebugGrid: boolean = false;
  protected showPlayerPaths: boolean = false;
  
  constructor(key: string) {
    super(key);
  }
  
  protected convertToPixelsX(percentage: number): number {
    return this.fieldX + (percentage / 100) * this.fieldWidth;
  }
  
  protected convertToPixelsY(percentage: number): number {
    return this.fieldY + (percentage / 100) * this.fieldHeight;
  }
  
  updateMatchState(newState: MatchState): void {
    // This will be implemented by derived classes
  }
}
