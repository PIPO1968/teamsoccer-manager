
import Phaser from 'phaser';

export class BallManager {
  private ball: Phaser.GameObjects.Arc;
  private ballShadow: Phaser.GameObjects.Ellipse;
  private convertToPixelsX: (percentage: number) => number;
  private convertToPixelsY: (percentage: number) => number;
  private ballPosition = { x: 50, y: 50 };
  private ballVelocity = { x: 0, y: 0 };
  private ballSpeed = 0;
  private ballFriction = 0.95; // How quickly the ball slows down
  private ballMaxSpeed = 2.5;
  private ballPossessor: number | null = null;
  private lastKicker: number | null = null;
  
  constructor(
    ball: Phaser.GameObjects.Arc,
    ballShadow: Phaser.GameObjects.Ellipse,
    convertToPixelsX: (percentage: number) => number,
    convertToPixelsY: (percentage: number) => number
  ) {
    this.ball = ball;
    this.ballShadow = ballShadow;
    this.convertToPixelsX = convertToPixelsX;
    this.convertToPixelsY = convertToPixelsY;
  }
  
  updateBallPosition(x: number, y: number): void {
    const pixelX = this.convertToPixelsX(x);
    const pixelY = this.convertToPixelsY(y);
    
    this.ball.setPosition(pixelX, pixelY);
    this.ballShadow.setPosition(pixelX, pixelY + 5); // Shadow is slightly below
    this.ballPosition = { x, y };
  }
  
  kickBall(direction: { x: number, y: number }, power: number, playerId: number): void {
    // Normalize direction
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    
    if (magnitude === 0) return; // No direction
    
    const normalizedDirection = {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };
    
    // Set velocity with power and direction
    this.ballVelocity = {
      x: normalizedDirection.x * power,
      y: normalizedDirection.y * power
    };
    
    this.ballSpeed = power;
    
    // Update last kicker
    this.lastKicker = playerId;
    
    // Ball is no longer possessed
    this.ballPossessor = null;
  }
  
  updateBallPhysics(): void {
    // If ball is possessed, don't update physics
    if (this.ballPossessor !== null) return;
    
    // Apply velocity
    this.ballPosition.x += this.ballVelocity.x;
    this.ballPosition.y += this.ballVelocity.y;
    
    // Apply friction
    this.ballVelocity.x *= this.ballFriction;
    this.ballVelocity.y *= this.ballFriction;
    
    // Update ball speed
    this.ballSpeed = Math.sqrt(
      this.ballVelocity.x * this.ballVelocity.x + 
      this.ballVelocity.y * this.ballVelocity.y
    );
    
    // Update visual position
    this.updateBallPosition(this.ballPosition.x, this.ballPosition.y);
    
    // If ball is very slow, set velocity to zero
    if (this.ballSpeed < 0.02) {
      this.ballVelocity = { x: 0, y: 0 };
      this.ballSpeed = 0;
    }
    
    // Check boundary collisions
    this.handleBoundaryCollisions();
  }
  
  handleBoundaryCollisions(): void {
    // Side boundaries
    if (this.ballPosition.x < 5) {
      this.ballPosition.x = 5;
      this.ballVelocity.x *= -0.6; // Bounce with energy loss
    } else if (this.ballPosition.x > 95) {
      this.ballPosition.x = 95;
      this.ballVelocity.x *= -0.6;
    }
    
    // Top/bottom boundaries
    if (this.ballPosition.y < 5) {
      this.ballPosition.y = 5;
      this.ballVelocity.y *= -0.6;
    } else if (this.ballPosition.y > 95) {
      this.ballPosition.y = 95;
      this.ballVelocity.y *= -0.6;
    }
    
    // Goal area detection
    if ((this.ballPosition.x < 5 || this.ballPosition.x > 95) && 
        (this.ballPosition.y > 35 && this.ballPosition.y < 65)) {
      // Goal scored! We'll handle this in the game logic
    }
  }
  
  getBallPosition(): { x: number, y: number } {
    return { ...this.ballPosition };
  }
  
  getBallVelocity(): { x: number, y: number } {
    return { ...this.ballVelocity };
  }
  
  getBallSpeed(): number {
    return this.ballSpeed;
  }
  
  setBallPossessor(playerId: number | null): void {
    this.ballPossessor = playerId;
    
    // If ball is possessed, stop it
    if (playerId !== null) {
      this.ballVelocity = { x: 0, y: 0 };
      this.ballSpeed = 0;
    }
  }
  
  getBallPossessor(): number | null {
    return this.ballPossessor;
  }
  
  getLastKicker(): number | null {
    return this.lastKicker;
  }
  
  resetBall(): void {
    this.updateBallPosition(50, 50);
    this.ballVelocity = { x: 0, y: 0 };
    this.ballSpeed = 0;
    this.ballPossessor = null;
    this.lastKicker = null;
  }
}
