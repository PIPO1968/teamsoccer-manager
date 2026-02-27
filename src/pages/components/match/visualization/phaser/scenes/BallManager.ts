
import Phaser from 'phaser';
import { createBall } from '../renderers/ballRenderer';

export class BallManager {
  private scene: Phaser.Scene;
  private ball: Phaser.GameObjects.Arc;
  private ballTrail: Phaser.GameObjects.Graphics;
  private convertToPixelsX: (percentage: number) => number;
  private convertToPixelsY: (percentage: number) => number;
  private movementEstimator: any;

  constructor(
    scene: Phaser.Scene,
    convertToPixelsX: (percentage: number) => number,
    convertToPixelsY: (percentage: number) => number,
    movementEstimator: any
  ) {
    this.scene = scene;
    this.convertToPixelsX = convertToPixelsX;
    this.convertToPixelsY = convertToPixelsY;
    this.movementEstimator = movementEstimator;
    
    // Create ball trail graphics
    this.ballTrail = scene.add.graphics();
    
    // Create ball
    const centerX = this.convertToPixelsX(50);
    const centerY = this.convertToPixelsY(50);
    this.ball = createBall(this.scene, centerX, centerY);
  }

  public updateBallPosition(position: { x: number; y: number }, path?: { x: number; y: number }[]): void {
    // Convert percentage positions to pixel coordinates
    const ballX = this.convertToPixelsX(position.x);
    const ballY = this.convertToPixelsY(position.y);
    
    // Get ball path for visualization
    const ballPath = path || this.movementEstimator.getBallPath();
    
    // Draw ball trail
    this.ballTrail.clear();
    this.ballTrail.lineStyle(3, 0xffffff, 0.3);
    
    // Draw path if available
    if (ballPath && ballPath.length > 1) {
      this.ballTrail.beginPath();
      
      // Start from current ball position
      this.ballTrail.moveTo(this.ball.x, this.ball.y);
      
      // Draw lines through all path points
      ballPath.forEach(point => {
        const pathX = this.convertToPixelsX(point.x);
        const pathY = this.convertToPixelsY(point.y);
        this.ballTrail.lineTo(pathX, pathY);
      });
      
      this.ballTrail.stroke();
    } else {
      // No path, draw simple line
      this.ballTrail.beginPath();
      this.ballTrail.moveTo(this.ball.x, this.ball.y);
      this.ballTrail.lineTo(ballX, ballY);
      this.ballTrail.stroke();
    }
    
    // Smooth ball movement with tweens
    this.scene.tweens.add({
      targets: this.ball,
      x: ballX,
      y: ballY,
      duration: 150,
      ease: 'Linear'
    });
  }

  public getBall(): Phaser.GameObjects.Arc {
    return this.ball;
  }

  public getBallTrail(): Phaser.GameObjects.Graphics {
    return this.ballTrail;
  }
}
