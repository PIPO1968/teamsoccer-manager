
import Phaser from 'phaser';

// Draw the basic soccer field elements
export const drawFieldElements = (
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number
): void => {
  // Clear previous drawing
  graphics.clear();
  
  // Field constants based on FIFA regulations (used for proportions)
  const centerCircleRadius = width * 0.1;
  const penaltyAreaWidth = width * 0.16;
  const penaltyAreaHeight = height * 0.44;
  const goalAreaWidth = width * 0.06;
  const goalAreaHeight = height * 0.22;
  const cornerRadius = width * 0.02;
  const penaltyArcRadius = width * 0.1;
  const penaltySpotDistance = width * 0.11;
  const goalWidth = 5;
  const goalDepth = height * 0.12;
  const lineWidth = 2;
  
  // Field background with stripe pattern
  // Main field color
  graphics.fillStyle(0x5BBD2B); // Bright green base
  graphics.fillRect(offsetX, offsetY, width, height);
  
  // Draw alternating darker green stripes
  graphics.fillStyle(0x4CAF23); // Slightly darker green for stripes
  const stripeCount = 12;
  const stripeWidth = width / stripeCount;
  for (let i = 0; i < stripeCount; i += 2) {
    graphics.fillRect(
      offsetX + i * stripeWidth, 
      offsetY, 
      stripeWidth, 
      height
    );
  }
  
  // Field outline and markings (all white)
  graphics.lineStyle(lineWidth, 0xFFFFFF, 1);
  
  // Field outline
  graphics.strokeRect(offsetX, offsetY, width, height);
  
  // Center line
  graphics.beginPath();
  graphics.moveTo(offsetX + width / 2, offsetY);
  graphics.lineTo(offsetX + width / 2, offsetY + height);
  graphics.strokePath();
  
  // Center circle
  graphics.beginPath();
  graphics.arc(
    offsetX + width / 2, 
    offsetY + height / 2, 
    centerCircleRadius, 
    0, 
    Math.PI * 2
  );
  graphics.strokePath();
  
  // Center spot
  graphics.fillStyle(0xFFFFFF);
  graphics.fillCircle(
    offsetX + width / 2, 
    offsetY + height / 2, 
    3
  );
  
  // Penalty areas
  // Left (away) penalty area
  graphics.lineStyle(lineWidth, 0xFFFFFF, 1);
  graphics.strokeRect(
    offsetX, 
    offsetY + (height - penaltyAreaHeight) / 2, 
    penaltyAreaWidth, 
    penaltyAreaHeight
  );
  
  // Right (home) penalty area
  graphics.strokeRect(
    offsetX + width - penaltyAreaWidth, 
    offsetY + (height - penaltyAreaHeight) / 2, 
    penaltyAreaWidth, 
    penaltyAreaHeight
  );
  
  // Goal areas
  // Left (away) goal area
  graphics.strokeRect(
    offsetX, 
    offsetY + (height - goalAreaHeight) / 2, 
    goalAreaWidth, 
    goalAreaHeight
  );
  
  // Right (home) goal area
  graphics.strokeRect(
    offsetX + width - goalAreaWidth, 
    offsetY + (height - goalAreaHeight) / 2, 
    goalAreaWidth, 
    goalAreaHeight
  );
  
  // Penalty spots
  // Left (away) penalty spot
  graphics.fillStyle(0xFFFFFF);
  graphics.fillCircle(
    offsetX + penaltySpotDistance, 
    offsetY + height / 2, 
    3
  );
  
  // Right (home) penalty spot
  graphics.fillCircle(
    offsetX + width - penaltySpotDistance, 
    offsetY + height / 2, 
    3
  );
  
  // Penalty arcs
  // Left (away) penalty arc
  graphics.lineStyle(lineWidth, 0xFFFFFF, 1);
  graphics.beginPath();
  graphics.arc(
    offsetX + penaltySpotDistance,
    offsetY + height / 2,
    penaltyArcRadius,
    -0.7,
    0.7,
    false
  );
  graphics.strokePath();
  
  // Right (home) penalty arc
  graphics.beginPath();
  graphics.arc(
    offsetX + width - penaltySpotDistance,
    offsetY + height / 2,
    penaltyArcRadius,
    Math.PI - 0.7,
    Math.PI + 0.7,
    false
  );
  graphics.strokePath();
  
  // Corner arcs - Make these distinct and clear
  const cornerArcRadius = width * 0.02;
  
  // Top-left corner
  graphics.beginPath();
  graphics.arc(
    offsetX, 
    offsetY, 
    cornerArcRadius, 
    0, 
    Math.PI / 2
  );
  graphics.strokePath();
  
  // Top-right corner
  graphics.beginPath();
  graphics.arc(
    offsetX + width, 
    offsetY, 
    cornerArcRadius, 
    Math.PI / 2, 
    Math.PI
  );
  graphics.strokePath();
  
  // Bottom-left corner
  graphics.beginPath();
  graphics.arc(
    offsetX, 
    offsetY + height, 
    cornerArcRadius, 
    Math.PI * 3 / 2, 
    0
  );
  graphics.strokePath();
  
  // Bottom-right corner
  graphics.beginPath();
  graphics.arc(
    offsetX + width, 
    offsetY + height, 
    cornerArcRadius, 
    Math.PI, 
    Math.PI * 3 / 2
  );
  graphics.strokePath();
  
  // Goals
  // Left (away) goal
  graphics.fillStyle(0xFFFFFF);
  graphics.lineStyle(lineWidth, 0xFFFFFF, 1);
  graphics.strokeRect(
    offsetX - goalWidth, 
    offsetY + (height - goalDepth) / 2, 
    goalWidth, 
    goalDepth
  );
  
  // Right (home) goal
  graphics.strokeRect(
    offsetX + width, 
    offsetY + (height - goalDepth) / 2, 
    goalWidth, 
    goalDepth
  );
};

// Create and return a field graphics object
export const createField = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number, 
  height: number
): Phaser.GameObjects.Graphics => {
  const field = scene.add.graphics();
  drawFieldElements(field, width, height, x, y);
  return field;
};
