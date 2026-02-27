
import Phaser from 'phaser';
import { PathfindingManager } from './PathfindingManager';

export class DebugVisualizer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private fieldX: number;
  private fieldY: number;
  private fieldWidth: number;
  private fieldHeight: number;
  private pathfindingManager: PathfindingManager;
  private convertToPixelsX: (percentage: number) => number;
  private convertToPixelsY: (percentage: number) => number;
  
  constructor(
    scene: Phaser.Scene,
    graphics: Phaser.GameObjects.Graphics,
    fieldX: number,
    fieldY: number,
    fieldWidth: number,
    fieldHeight: number,
    pathfindingManager: PathfindingManager,
    convertToPixelsX: (percentage: number) => number,
    convertToPixelsY: (percentage: number) => number
  ) {
    this.scene = scene;
    this.graphics = graphics;
    this.fieldX = fieldX;
    this.fieldY = fieldY;
    this.fieldWidth = fieldWidth;
    this.fieldHeight = fieldHeight;
    this.pathfindingManager = pathfindingManager;
    this.convertToPixelsX = convertToPixelsX;
    this.convertToPixelsY = convertToPixelsY;
  }
  
  updateDebugVisualization(
    playersData: { id: number, position: { x: number, y: number }, teamId: number, role: string }[],
    ballPosition: { x: number, y: number },
    ballVelocity: { x: number, y: number },
    ballPossessorId: number | null,
    showPaths: boolean,
    stealCooldown: number,
    maxStealCooldown: number
  ): void {
    // Clear previous debug graphics
    this.graphics.clear();
    
    // Draw grid
    this.drawGrid();
    
    // Draw ball info
    this.drawBallInfo(ballPosition, ballVelocity);
    
    // Draw player info and areas of influence
    for (const playerData of playersData) {
      this.drawPlayerDebugInfo(
        playerData.id,
        playerData.position,
        playerData.teamId,
        playerData.role,
        ballPossessorId === playerData.id
      );
    }
    
    // Draw cooldown indicator
    if (stealCooldown > 0) {
      const cooldownPercentage = stealCooldown / maxStealCooldown;
      this.drawCooldownIndicator(cooldownPercentage);
    }
  }
  
  private drawGrid(): void {
    const { width: gridWidth, height: gridHeight } = this.pathfindingManager.getGridDimensions();
    const cellWidth = this.fieldWidth / gridWidth;
    const cellHeight = this.fieldHeight / gridHeight;
    
    // Draw grid lines
    this.graphics.lineStyle(1, 0xffffff, 0.2);
    
    // Vertical lines
    for (let x = 0; x <= gridWidth; x++) {
      const posX = this.fieldX + (x * cellWidth);
      this.graphics.beginPath();
      this.graphics.moveTo(posX, this.fieldY);
      this.graphics.lineTo(posX, this.fieldY + this.fieldHeight);
      this.graphics.closePath();
      this.graphics.strokePath();
    }
    
    // Horizontal lines
    for (let y = 0; y <= gridHeight; y++) {
      const posY = this.fieldY + (y * cellHeight);
      this.graphics.beginPath();
      this.graphics.moveTo(this.fieldX, posY);
      this.graphics.lineTo(this.fieldX + this.fieldWidth, posY);
      this.graphics.closePath();
      this.graphics.strokePath();
    }
    
    // Draw field thirds
    this.graphics.lineStyle(2, 0xffffff, 0.4);
    
    // Attacking third lines
    const attackingThirdX1 = this.fieldX + (this.fieldWidth / 3);
    const attackingThirdX2 = this.fieldX + ((this.fieldWidth / 3) * 2);
    
    this.graphics.beginPath();
    this.graphics.moveTo(attackingThirdX1, this.fieldY);
    this.graphics.lineTo(attackingThirdX1, this.fieldY + this.fieldHeight);
    this.graphics.closePath();
    this.graphics.strokePath();
    
    this.graphics.beginPath();
    this.graphics.moveTo(attackingThirdX2, this.fieldY);
    this.graphics.lineTo(attackingThirdX2, this.fieldY + this.fieldHeight);
    this.graphics.closePath();
    this.graphics.strokePath();
  }
  
  private drawBallInfo(
    ballPosition: { x: number, y: number },
    ballVelocity: { x: number, y: number }
  ): void {
    const ballPixelX = this.convertToPixelsX(ballPosition.x);
    const ballPixelY = this.convertToPixelsY(ballPosition.y);
    
    // Draw ball velocity vector
    if (ballVelocity.x !== 0 || ballVelocity.y !== 0) {
      const velocityMagnitude = Math.sqrt(
        ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y
      );
      
      if (velocityMagnitude > 0.05) {
        const normalizedVelX = ballVelocity.x / velocityMagnitude;
        const normalizedVelY = ballVelocity.y / velocityMagnitude;
        const lineLength = velocityMagnitude * 20;
        
        // Draw velocity vector
        this.graphics.lineStyle(2, 0x00ff00, 0.7);
        this.graphics.beginPath();
        this.graphics.moveTo(ballPixelX, ballPixelY);
        this.graphics.lineTo(
          ballPixelX + normalizedVelX * lineLength,
          ballPixelY + normalizedVelY * lineLength
        );
        this.graphics.closePath();
        this.graphics.strokePath();
      }
    }
    
    // Draw ball position indicator
    this.graphics.lineStyle(1, 0xffff00, 0.5);
    this.graphics.strokeCircle(ballPixelX, ballPixelY, 15);
  }
  
  private drawPlayerDebugInfo(
    playerId: number,
    position: { x: number, y: number },
    teamId: number,
    role: string,
    hasPossession: boolean
  ): void {
    const playerPixelX = this.convertToPixelsX(position.x);
    const playerPixelY = this.convertToPixelsY(position.y);
    
    // Color based on team and possession
    const teamColor = teamId === 1 ? 0xff0000 : 0x0000ff;
    const alpha = hasPossession ? 1.0 : 0.5;
    
    // Draw influence circle
    let influenceRadius = 15;
    switch (role) {
      case 'goalkeeper':
        influenceRadius = 10;
        break;
      case 'defender':
        influenceRadius = 15;
        break;
      case 'midfielder':
        influenceRadius = 20;
        break;
      case 'forward':
        influenceRadius = 18;
        break;
    }
    
    // Draw role-specific zone
    this.graphics.lineStyle(1, teamColor, 0.3);
    this.graphics.strokeCircle(playerPixelX, playerPixelY, influenceRadius);
    
    // If player has possession, draw additional indicator
    if (hasPossession) {
      this.graphics.lineStyle(2, 0xffff00, 0.8);
      this.graphics.strokeCircle(playerPixelX, playerPixelY, influenceRadius + 5);
    }
  }
  
  private drawCooldownIndicator(cooldownPercentage: number): void {
    // Draw cooldown indicator at top of screen
    const barWidth = 100;
    const barHeight = 10;
    const barX = this.scene.cameras.main.width / 2 - barWidth / 2;
    const barY = 10;
    
    // Draw background
    this.graphics.fillStyle(0x333333, 0.7);
    this.graphics.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw foreground (remaining cooldown)
    this.graphics.fillStyle(0xff0000, 0.7);
    this.graphics.fillRect(barX, barY, barWidth * cooldownPercentage, barHeight);
  }
}
