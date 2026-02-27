
import Phaser from 'phaser';

export function createBall(
  scene: Phaser.Scene, 
  x: number, 
  y: number
): Phaser.GameObjects.Arc {
  // Create ball shadow
  const ballShadow = scene.add.ellipse(
    x, 
    y + 5, 
    10, 
    4, 
    0x000000, 
    0.3
  );
  
  // Create ball
  const ball = scene.add.circle(
    x, 
    y, 
    6,
    0xffffff
  );
  
  // Add pattern/details to the ball
  const detail = scene.add.graphics();
  detail.lineStyle(1, 0x000000, 0.5);
  detail.beginPath();
  detail.arc(x, y, 6, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false);
  detail.strokePath();
  
  // Add pattern lines
  detail.beginPath();
  detail.arc(x, y, 3, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false);
  detail.moveTo(x - 6, y);
  detail.lineTo(x + 6, y);
  detail.moveTo(x, y - 6);
  detail.lineTo(x, y + 6);
  detail.strokePath();
  
  // Store the shadow reference in the ball's data
  ball.setData('shadow', ballShadow);
  
  return ball;
}
