import Phaser from 'phaser';

// Create the ball object
export const createBall = (
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.GameObjects.Arc => {
  // Main ball circle
  const ball = scene.add.circle(x, y, 5, 0xffffff);
  ball.setStrokeStyle(1, 0x000000);
  
  // Add ball shadow
  const shadow = scene.add.ellipse(
    x + 2,
    y + 2,
    8,
    4,
    0x000000,
    0.3
  );
  
  // Add the ball to the scene and make it slightly above other objects
  ball.setDepth(10);
  shadow.setDepth(9);
  
  // Store shadow reference for position updates
  ball.setData('shadow', shadow);
  
  // Create update event to keep shadow with ball
  scene.events.on('update', () => {
    shadow.setPosition(ball.x + 2, ball.y + 2);
  });
  
  return ball;
};
