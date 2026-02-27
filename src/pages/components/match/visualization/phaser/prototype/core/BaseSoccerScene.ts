
import Phaser from 'phaser';
import { PathfindingManager } from './PathfindingManager';
import { PlayerManager } from './PlayerManager';
import { BallManager } from './BallManager';
import { DebugVisualizer } from './DebugVisualizer';
import { PossessionManager } from './PossessionManager';

export class BaseSoccerScene extends Phaser.Scene {
  // Field dimensions
  protected fieldWidth!: number;
  protected fieldHeight!: number;
  protected fieldX!: number;
  protected fieldY!: number;
  
  // Game elements
  protected field!: Phaser.GameObjects.Graphics;
  protected ball!: Phaser.GameObjects.Arc;
  protected ballShadow!: Phaser.GameObjects.Ellipse;
  protected debugGraphics!: Phaser.GameObjects.Graphics;
  protected scoreText!: Phaser.GameObjects.Text;
  
  // Manager instances
  protected playerManager!: PlayerManager;
  protected ballManager!: BallManager;
  protected debugVisualizer!: DebugVisualizer;
  protected pathfindingManager!: PathfindingManager;
  protected possessionManager!: PossessionManager;
  
  // Game state
  protected homeScore: number = 0;
  protected awayScore: number = 0;
  protected showDebugGrid: boolean = true;
  protected showPlayerPaths: boolean = true;
  protected ballPossessor: number | null = null;
  
  // Team colors
  protected homeTeamColor: number = 0xff0000; // Default: Red
  protected awayTeamColor: number = 0x0000ff; // Default: Blue
  
  constructor(key: string) {
    super(key);
  }
  
  // Helper methods to convert percentage to pixel coordinates
  protected convertToPixelsX(percentage: number): number {
    return this.fieldX + (percentage / 100) * this.fieldWidth;
  }
  
  protected convertToPixelsY(percentage: number): number {
    return this.fieldY + (percentage / 100) * this.fieldHeight;
  }
}
