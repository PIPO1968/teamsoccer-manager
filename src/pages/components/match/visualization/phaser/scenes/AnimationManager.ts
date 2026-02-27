
import Phaser from 'phaser';
import { MatchEventData } from '../../../types/matchTypes';

export interface AnimationItem {
  event: MatchEventData;
  duration: number;
  progress: number;
  started: boolean;
}

export class AnimationManager {
  private scene: Phaser.Scene;
  private animationQueue: AnimationItem[] = [];
  private playerSprites: {[key: number]: Phaser.GameObjects.Container};
  private ball: Phaser.GameObjects.Arc;
  private ballTrail: Phaser.GameObjects.Graphics;
  private convertToPixelsX: (percentage: number) => number;
  private convertToPixelsY: (percentage: number) => number;
  private currentMatchState: any;

  constructor(
    scene: Phaser.Scene, 
    playerSprites: {[key: number]: Phaser.GameObjects.Container},
    ball: Phaser.GameObjects.Arc,
    ballTrail: Phaser.GameObjects.Graphics,
    convertToPixelsX: (percentage: number) => number,
    convertToPixelsY: (percentage: number) => number,
    currentMatchState: any
  ) {
    this.scene = scene;
    this.playerSprites = playerSprites;
    this.ball = ball;
    this.ballTrail = ballTrail;
    this.convertToPixelsX = convertToPixelsX;
    this.convertToPixelsY = convertToPixelsY;
    this.currentMatchState = currentMatchState;
  }

  public queueEventAnimation(event: MatchEventData): void {
    // Get animation duration based on event type
    const duration = this.getAnimationDurationForEvent(event.type);
    
    // Add to animation queue
    this.animationQueue.push({
      event,
      duration,
      progress: 0,
      started: false
    });
  }

  public processAnimations(delta: number): void {
    if (this.animationQueue.length === 0) return;
    
    // Process the first animation in the queue
    const animation = this.animationQueue[0];
    
    // Start animation if not started
    if (!animation.started) {
      this.startEventAnimation(animation.event);
      animation.started = true;
    }
    
    // Update animation progress
    animation.progress += delta / animation.duration;
    
    // Update the animation
    this.updateEventAnimation(animation.event, animation.progress);
    
    // Remove completed animations
    if (animation.progress >= 1) {
      this.completeEventAnimation(animation.event);
      this.animationQueue.shift();
    }
  }

  private startEventAnimation(event: MatchEventData): void {
    switch (event.type) {
      case 'goal':
        this.startGoalAnimation(event);
        break;
      case 'shot':
        this.startShotAnimation(event);
        break;
      case 'yellow_card':
      case 'red_card':
        this.startCardAnimation(event);
        break;
      case 'foul':
        this.startFoulAnimation(event);
        break;
    }
  }

  private updateEventAnimation(event: MatchEventData, progress: number): void {
    switch (event.type) {
      case 'goal':
        this.updateGoalAnimation(event, progress);
        break;
      case 'shot':
        this.updateShotAnimation(event, progress);
        break;
      case 'yellow_card':
      case 'red_card':
        this.updateCardAnimation(event, progress);
        break;
      case 'foul':
        this.updateFoulAnimation(event, progress);
        break;
    }
  }

  private completeEventAnimation(event: MatchEventData): void {
    switch (event.type) {
      case 'goal':
        this.completeGoalAnimation(event);
        break;
      case 'shot':
        this.completeShotAnimation(event);
        break;
      case 'yellow_card':
      case 'red_card':
        this.completeCardAnimation(event);
        break;
      case 'foul':
        this.completeFoulAnimation(event);
        break;
    }
  }

  // Animation handlers for specific events
  private startGoalAnimation(event: MatchEventData): void {
    // Find player sprite
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // Move ball to player position
    this.ball.setPosition(playerSprite.x, playerSprite.y);
    
    // Clear any existing ball trail
    this.ballTrail.clear();
  }

  private updateGoalAnimation(event: MatchEventData, progress: number): void {
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // Determine goal position based on team
    const goalX = (event.team === 'home') ? 
      this.convertToPixelsX(90) : 
      this.convertToPixelsX(10);
    const goalY = this.convertToPixelsY(50);
    
    // Calculate ball position along trajectory
    const ballX = playerSprite.x + (goalX - playerSprite.x) * progress;
    const ballY = playerSprite.y + (goalY - playerSprite.y) * progress;
    
    // Draw ball trail
    this.ballTrail.clear();
    this.ballTrail.lineStyle(3, 0xffffff, 0.3);
    this.ballTrail.beginPath();
    this.ballTrail.moveTo(playerSprite.x, playerSprite.y);
    this.ballTrail.lineTo(ballX, ballY);
    this.ballTrail.stroke();
    
    // Update ball position
    this.ball.setPosition(ballX, ballY);
    
    // Add goal celebration effects at the end of animation
    if (progress > 0.9) {
      // Flash the goal area
      const goalArea = this.scene.add.circle(goalX, goalY, 30, 0xffff00, 0.5 - (progress - 0.9) * 5);
      this.scene.time.delayedCall(200, () => {
        goalArea.destroy();
      });
    }
  }

  private completeGoalAnimation(event: MatchEventData): void {
    // Update score
    if (event.team === 'home') {
      this.currentMatchState.homeScore++;
    } else {
      this.currentMatchState.awayScore++;
    }
    
    // Celebration effect
    const goalText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      'GOAL!',
      {
        fontSize: '48px',
        color: '#ffde00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    // Animate goal text
    this.scene.tweens.add({
      targets: goalText,
      scale: 1.5,
      duration: 500,
      ease: 'Bounce.Out',
      yoyo: true,
      onComplete: () => {
        this.scene.tweens.add({
          targets: goalText,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            goalText.destroy();
          }
        });
      }
    });
    
    // Clear ball trail
    this.ballTrail.clear();
  }

  private startShotAnimation(event: MatchEventData): void {
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // Move ball to player position
    this.ball.setPosition(playerSprite.x, playerSprite.y);
    
    // Clear any existing ball trail
    this.ballTrail.clear();
  }

  private updateShotAnimation(event: MatchEventData, progress: number): void {
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // Determine target position based on team
    const targetX = (event.team === 'home') ? 
      this.convertToPixelsX(90) : 
      this.convertToPixelsX(10);
    const targetY = this.convertToPixelsY(50 + (Math.random() * 40 - 20));
    
    // Calculate ball position along trajectory
    const ballX = playerSprite.x + (targetX - playerSprite.x) * progress;
    const ballY = playerSprite.y + (targetY - playerSprite.y) * progress;
    
    // Draw ball trail
    this.ballTrail.clear();
    this.ballTrail.lineStyle(3, 0xffffff, 0.3);
    this.ballTrail.beginPath();
    this.ballTrail.moveTo(playerSprite.x, playerSprite.y);
    this.ballTrail.lineTo(ballX, ballY);
    this.ballTrail.stroke();
    
    // Update ball position
    this.ball.setPosition(ballX, ballY);
  }

  private completeShotAnimation(event: MatchEventData): void {
    // Shot effect - e.g. "Shot wide!" text
    const shotResult = this.scene.add.text(
      this.ball.x,
      this.ball.y - 20,
      'Shot!',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Animate and fade out
    this.scene.tweens.add({
      targets: shotResult,
      y: shotResult.y - 20,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        shotResult.destroy();
      }
    });
    
    // Clear ball trail
    this.ballTrail.clear();
    
    // Return ball to center
    this.scene.tweens.add({
      targets: this.ball,
      x: this.convertToPixelsX(50),
      y: this.convertToPixelsY(50),
      duration: 800,
      ease: 'Linear'
    });
  }

  private startCardAnimation(event: MatchEventData): void {
    if (!event.playerId) return;
    // No setup needed
  }

  private updateCardAnimation(event: MatchEventData, progress: number): void {
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // If this is the first update, create the card graphic
    if (progress < 0.1) {
      // Card color
      const cardColor = event.type === 'yellow_card' ? 0xffff00 : 0xff0000;
      
      // Create a card graphic above the player
      const card = this.scene.add.rectangle(
        playerSprite.x,
        playerSprite.y - 30,
        15,
        20,
        cardColor
      ).setOrigin(0.5);
      
      // Store it on the player sprite for later reference
      (playerSprite as any).cardGraphic = card;
    }
    
    // Animate the card raising up
    const card = (playerSprite as any).cardGraphic;
    if (card) {
      // Raise the card up from the referee position
      card.y = playerSprite.y - 30 - (20 * progress);
      
      // Add a slight tilt effect
      card.rotation = Math.sin(progress * Math.PI * 2) * 0.2;
    }
  }

  private completeCardAnimation(event: MatchEventData): void {
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // Get the card graphic
    const card = (playerSprite as any).cardGraphic;
    
    if (card) {
      // Fade out the card
      this.scene.tweens.add({
        targets: card,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          card.destroy();
          (playerSprite as any).cardGraphic = null;
        }
      });
    }
    
    // If it's a red card, mark the player as sent off
    if (event.type === 'red_card') {
      // Add a red X over the player
      const redX = this.scene.add.text(
        playerSprite.x,
        playerSprite.y,
        'X',
        {
          fontSize: '24px',
          color: '#ff0000',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
      
      // Attach the X to the player
      (playerSprite as any).redCard = redX;
      
      // Make the player semi-transparent
      playerSprite.setAlpha(0.5);
    }
  }

  private startFoulAnimation(event: MatchEventData): void {
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // Create a foul indicator
    const foulIndicator = this.scene.add.text(
      playerSprite.x,
      playerSprite.y - 20,
      'Foul!',
      {
        fontSize: '16px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Store it for animation
    (playerSprite as any).foulIndicator = foulIndicator;
  }

  private updateFoulAnimation(event: MatchEventData, progress: number): void {
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // Get the foul indicator
    const foulIndicator = (playerSprite as any).foulIndicator;
    
    if (foulIndicator) {
      // Animate the foul text
      foulIndicator.y = playerSprite.y - 20 - (10 * progress);
      foulIndicator.alpha = 1 - progress;
    }
  }

  private completeFoulAnimation(event: MatchEventData): void {
    if (!event.playerId) return;
    const playerSprite = this.playerSprites[event.playerId];
    if (!playerSprite) return;
    
    // Get the foul indicator
    const foulIndicator = (playerSprite as any).foulIndicator;
    
    if (foulIndicator) {
      // Remove the foul indicator
      foulIndicator.destroy();
      (playerSprite as any).foulIndicator = null;
    }
  }

  public isAnimatableEvent(event: MatchEventData): boolean {
    // List of event types that should trigger animations
    const animatableTypes = [
      'goal', 'shot', 'save', 'foul', 'yellow_card', 'red_card', 
      'corner', 'throw_in', 'kick_off', 'injury'
    ];
    
    return animatableTypes.includes(event.type);
  }

  private getAnimationDurationForEvent(eventType: string): number {
    switch (eventType) {
      case 'goal':
        return 2000; // 2 seconds for goal animation
      case 'shot':
        return 1000; // 1 second for shot animation
      case 'yellow_card':
      case 'red_card':
        return 1500; // 1.5 seconds for card animations
      case 'foul':
        return 1000; // 1 second for foul animation
      default:
        return 1000; // Default animation duration
    }
  }
}
