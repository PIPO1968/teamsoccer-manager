
import Phaser from 'phaser';

export function createField(
  scene: Phaser.Scene, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): Phaser.GameObjects.Graphics {
  const field = scene.add.graphics();
  
  // Draw field background (grass)
  field.fillStyle(0x009900, 1);
  field.fillRect(x, y, width, height);
  
  // Draw field markings
  field.lineStyle(2, 0xffffff, 1);
  
  // Field outline
  field.strokeRect(x, y, width, height);
  
  // Center line
  field.beginPath();
  field.moveTo(x + width / 2, y);
  field.lineTo(x + width / 2, y + height);
  field.strokePath();
  
  // Center circle
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  field.strokeCircle(centerX, centerY, height * 0.15);
  field.fillStyle(0xffffff, 1);
  field.fillPoint(centerX, centerY, 5);
  
  // Penalty areas
  const penaltyAreaWidth = width * 0.15;
  const penaltyAreaHeight = height * 0.4;
  const penaltyAreaY = y + (height - penaltyAreaHeight) / 2;
  
  // Home penalty area (left)
  field.strokeRect(x, penaltyAreaY, penaltyAreaWidth, penaltyAreaHeight);
  
  // Away penalty area (right)
  field.strokeRect(
    x + width - penaltyAreaWidth, 
    penaltyAreaY, 
    penaltyAreaWidth, 
    penaltyAreaHeight
  );
  
  // Goal areas
  const goalWidth = width * 0.05;
  const goalHeight = height * 0.2;
  const goalY = y + (height - goalHeight) / 2;
  
  // Home goal area (left)
  field.strokeRect(x, goalY, goalWidth, goalHeight);
  
  // Away goal area (right)
  field.strokeRect(x + width - goalWidth, goalY, goalWidth, goalHeight);
  
  // Goals
  const goalDepth = 5;
  const goalPostHeight = height * 0.3;
  const goalPostY = y + (height - goalPostHeight) / 2;
  
  // Home goal (left)
  field.fillStyle(0xffffff, 0.5);
  field.fillRect(
    x - goalDepth, 
    goalPostY, 
    goalDepth, 
    goalPostHeight
  );
  
  // Away goal (right)
  field.fillRect(
    x + width, 
    goalPostY, 
    goalDepth, 
    goalPostHeight
  );
  
  return field;
}
