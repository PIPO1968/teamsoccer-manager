
import { BaseSoccerScene } from './BaseSoccerScene';
import { createField } from '../renderers/FieldRenderer';
import { createBall } from '../renderers/BallRenderer';
import { PlayerManager } from './PlayerManager';
import { BallManager } from './BallManager';
import { DebugVisualizer } from './DebugVisualizer';
import { PathfindingManager } from './PathfindingManager';
import { PossessionManager } from './PossessionManager';

export class SoccerPrototype extends BaseSoccerScene {
  constructor() {
    super('SoccerPrototype');
  }
  
  create(data: any) {
    // Calculate field dimensions
    const padding = 50;
    this.fieldWidth = this.cameras.main.width - (padding * 2);
    this.fieldHeight = (this.fieldWidth * 0.65); // 2:3 aspect ratio
    this.fieldX = padding;
    this.fieldY = (this.cameras.main.height - this.fieldHeight) / 2;
    
    // Apply team colors from data if available
    if (data) {
      if (data.homeTeamColor) {
        this.homeTeamColor = parseInt(data.homeTeamColor.replace('#', '0x'));
      }
      
      if (data.awayTeamColor) {
        this.awayTeamColor = parseInt(data.awayTeamColor.replace('#', '0x'));
      }
      
      if (data.showDebugGrid !== undefined) {
        this.showDebugGrid = data.showDebugGrid;
      }
      
      if (data.showPlayerPaths !== undefined) {
        this.showPlayerPaths = data.showPlayerPaths;
      }
    }
    
    // Create field
    this.field = createField(this, this.fieldX, this.fieldY, this.fieldWidth, this.fieldHeight);
    
    // Create debug graphics layer
    this.debugGraphics = this.add.graphics();
    
    // Create ball
    this.ball = createBall(
      this,
      this.convertToPixelsX(50),
      this.convertToPixelsY(50)
    );
    
    // Get the shadow from the ball's data
    this.ballShadow = this.ball.getData('shadow');
    
    // Create score display
    this.scoreText = this.add.text(
      this.cameras.main.width / 2,
      this.fieldY - 30,
      `${this.homeScore} - ${this.awayScore}`,
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Initialize managers
    this.initializeManagers();
    
    // Add keyboard toggles
    this.input.keyboard?.on('keydown-G', () => {
      this.showDebugGrid = !this.showDebugGrid;
    });
    
    this.input.keyboard?.on('keydown-P', () => {
      this.showPlayerPaths = !this.showPlayerPaths;
    });
    
    // Start the game
    this.setInitialState();
  }
  
  private initializeManagers(): void {
    // Initialize pathfinding
    this.pathfindingManager = new PathfindingManager(30, 20);
    
    // Initialize player manager
    this.playerManager = new PlayerManager(
      this,
      this.convertToPixelsX.bind(this),
      this.convertToPixelsY.bind(this)
    );
    
    // Create players with team colors
    this.playerManager.createPlayers(
      this.homeTeamColor,
      this.awayTeamColor
    );
    
    // Initialize ball manager
    this.ballManager = new BallManager(
      this.ball,
      this.ballShadow,
      this.convertToPixelsX.bind(this),
      this.convertToPixelsY.bind(this)
    );
    
    // Initialize possession manager
    this.possessionManager = new PossessionManager(
      this,
      this.ball,
      this.ballManager,
      this.playerManager,
      this.pathfindingManager
    );
    
    // Initialize debug visualizer
    this.debugVisualizer = new DebugVisualizer(
      this,
      this.debugGraphics,
      this.fieldX,
      this.fieldY,
      this.fieldWidth,
      this.fieldHeight,
      this.pathfindingManager,
      this.convertToPixelsX.bind(this),
      this.convertToPixelsY.bind(this)
    );
  }
  
  update() {
    // Clear debug graphics
    this.debugGraphics.clear();
    
    // Update ball physics
    this.ballManager.updateBallPhysics();
    
    // Check for goals
    this.checkForGoals();
    
    // Check for ball possession
    this.ballPossessor = this.possessionManager.checkBallPossession();
    
    // Move players based on roles and game state
    this.playerManager.movePlayersBasedOnRoles(
      this.ballManager.getBallPosition(),
      this.ballPossessor
    );
    
    // AI decision making
    this.possessionManager.makeAIDecisions();
    
    // Debug visualization
    if (this.showDebugGrid) {
      this.debugVisualizer.updateDebugVisualization(
        this.playerManager.getAllPlayersData(),
        this.ballManager.getBallPosition(),
        this.ballManager.getBallVelocity(),
        this.ballPossessor,
        this.showPlayerPaths,
        this.possessionManager.getStealCooldown(),
        this.possessionManager.getMaxStealCooldown()
      );
    }
    
    // Decrement steal cooldown
    this.possessionManager.decrementStealCooldown();
  }
  
  private checkForGoals(): void {
    const ballPos = this.ballManager.getBallPosition();
    
    // Goal dimensions (35-65 Y position range)
    const isInGoalYRange = ballPos.y > 35 && ballPos.y < 65;
    
    // Check home team goal (left side)
    if (ballPos.x < 5 && isInGoalYRange) {
      // Goal for away team!
      this.awayScore++;
      this.updateScoreDisplay();
      this.restartAfterGoal();
    }
    
    // Check away team goal (right side)
    if (ballPos.x > 95 && isInGoalYRange) {
      // Goal for home team!
      this.homeScore++;
      this.updateScoreDisplay();
      this.restartAfterGoal();
    }
  }
  
  private updateScoreDisplay(): void {
    this.scoreText.setText(`${this.homeScore} - ${this.awayScore}`);
  }
  
  private restartAfterGoal(): void {
    // Reset ball to center
    this.ballManager.resetBall();
    
    // Reset players to formation
    this.playerManager.resetPositions();
    
    // Reset possession state
    this.possessionManager.resetCooldown();
  }
  
  private setInitialState(): void {
    // Reset everything to start state
    this.ballManager.resetBall();
    this.playerManager.resetPositions();
    this.possessionManager.resetCooldown();
    this.possessionManager.randomizeTieBreaker();
    
    // Reset score
    this.homeScore = 0;
    this.awayScore = 0;
    this.updateScoreDisplay();
  }
}
