
import Phaser from 'phaser';
import { Player } from '../../../../../components/types/match';
import { createPlayer } from '../renderers/playerRenderer';
import { MovementUpdate } from '../utils/MovementEstimator';

export class PlayerManager {
  private scene: Phaser.Scene;
  private homePlayers: Player[];
  private awayPlayers: Player[];
  private playerSprites: {[key: number]: Phaser.GameObjects.Container} = {};
  private homeTeamColor: string;
  private awayTeamColor: string;
  private onPlayerClick?: (playerId: number) => void;
  private convertToPixelsX: (percentage: number) => number;
  private convertToPixelsY: (percentage: number) => number;
  private movementEstimator: any;

  constructor(
    scene: Phaser.Scene,
    homePlayers: Player[],
    awayPlayers: Player[],
    homeTeamColor: string,
    awayTeamColor: string,
    onPlayerClick: ((playerId: number) => void) | undefined,
    convertToPixelsX: (percentage: number) => number,
    convertToPixelsY: (percentage: number) => number,
    movementEstimator: any
  ) {
    this.scene = scene;
    this.homePlayers = homePlayers;
    this.awayPlayers = awayPlayers;
    this.homeTeamColor = homeTeamColor;
    this.awayTeamColor = awayTeamColor;
    this.onPlayerClick = onPlayerClick;
    this.convertToPixelsX = convertToPixelsX;
    this.convertToPixelsY = convertToPixelsY;
    this.movementEstimator = movementEstimator;
  }

  public createPlayers(): {[key: number]: Phaser.GameObjects.Container} {
    // Create home team players
    this.homePlayers.forEach(player => {
      const initialPos = this.movementEstimator.getPlayerPositions()[player.id];
      const x = this.convertToPixelsX(initialPos ? initialPos.x : player.x);
      const y = this.convertToPixelsY(initialPos ? initialPos.y : player.y);
      
      const sprite = createPlayer(
        this.scene,
        x,
        y,
        player,
        true,
        this.homeTeamColor
      );
      
      this.playerSprites[player.id] = sprite;
      
      // Add click handler
      sprite.setInteractive();
      sprite.on('pointerdown', () => {
        if (this.onPlayerClick) {
          this.onPlayerClick(player.id);
        }
      });
    });
    
    // Create away team players
    this.awayPlayers.forEach(player => {
      const initialPos = this.movementEstimator.getPlayerPositions()[player.id];
      const x = this.convertToPixelsX(initialPos ? initialPos.x : player.x);
      const y = this.convertToPixelsY(initialPos ? initialPos.y : player.y);
      
      const sprite = createPlayer(
        this.scene,
        x,
        y,
        player,
        false,
        this.awayTeamColor
      );
      
      this.playerSprites[player.id] = sprite;
      
      // Add click handler
      sprite.setInteractive();
      sprite.on('pointerdown', () => {
        if (this.onPlayerClick) {
          this.onPlayerClick(player.id);
        }
      });
    });

    return this.playerSprites;
  }

  public updatePlayerSprite(movement: MovementUpdate): void {
    const sprite = this.playerSprites[movement.playerId];
    if (!sprite) return;
    
    // Convert percentage positions to pixel coordinates
    const targetX = this.convertToPixelsX(movement.x);
    const targetY = this.convertToPixelsY(movement.y);
    
    // If the movement includes a path, use it for smoother movement
    if (movement.path && movement.path.length > 0) {
      // Clear any existing tweens for this sprite
      this.scene.tweens.killTweensOf(sprite);
      
      // Create path points in pixel coordinates
      const pathPoints = movement.path.map(point => ({
        x: this.convertToPixelsX(point.x),
        y: this.convertToPixelsY(point.y)
      }));
      
      // Use the first point in the path
      this.scene.tweens.add({
        targets: sprite,
        x: pathPoints[0].x,
        y: pathPoints[0].y,
        duration: 200,
        ease: 'Linear',
        onComplete: () => {
          // If we have more points, continue movement in the next frame
          // We don't start a chain of tweens here as it's better to 
          // let the movement system control the path progression
        }
      });
      
      // Rotate player based on movement direction
      if (movement.isRunning && (movement.direction.x !== 0 || movement.direction.y !== 0)) {
        const angle = Math.atan2(movement.direction.y, movement.direction.x);
        const playerCircle = sprite.getAt(0) as Phaser.GameObjects.Shape;
        
        if (playerCircle) {
          playerCircle.setRotation(angle);
        }
      }
    } else {
      // Apply position directly for small movements
      const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, targetX, targetY);
      
      if (distance < 5) {
        sprite.setPosition(targetX, targetY);
      } else {
        // Use tweens for larger movements to make them smooth
        this.scene.tweens.add({
          targets: sprite,
          x: targetX,
          y: targetY,
          duration: 200,  // Short duration for smoother updates
          ease: 'Linear'
        });
        
        // Rotate player based on direction if they're moving
        if (movement.isRunning && (movement.direction.x !== 0 || movement.direction.y !== 0)) {
          const angle = Math.atan2(movement.direction.y, movement.direction.x);
          const playerCircle = sprite.getAt(0) as Phaser.GameObjects.Shape;
          
          if (playerCircle) {
            // Apply a subtle rotation to indicate direction
            playerCircle.setRotation(angle);
          }
        }
      }
    }
  }

  public getPlayerSprites(): {[key: number]: Phaser.GameObjects.Container} {
    return this.playerSprites;
  }
}
