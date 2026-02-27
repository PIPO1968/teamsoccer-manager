
import Phaser from 'phaser';

// Apply weather effects to the field
export const applyWeatherEffects = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  weather: string,
  fieldWidth: number,
  fieldHeight: number,
  fieldX: number,
  fieldY: number
): void => {
  // Clear existing effects
  container.removeAll(true);
  
  switch (weather) {
    case 'rainy':
      addRainEffects(scene, container, fieldWidth, fieldHeight, fieldX, fieldY);
      break;
    case 'cloudy':
      addCloudyEffects(scene, container, fieldWidth, fieldHeight, fieldX, fieldY);
      break;
    case 'sunny':
      addSunnyEffects(scene, container, fieldWidth, fieldHeight, fieldX, fieldY);
      break;
    case 'partlyCloudy':
      addPartlyCloudyEffects(scene, container, fieldWidth, fieldHeight, fieldX, fieldY);
      break;
    default:
      // Default to clear weather (no effects)
      break;
  }
};

// Add rain effects
const addRainEffects = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  fieldWidth: number,
  fieldHeight: number,
  fieldX: number,
  fieldY: number
): void => {
  // Darken field
  const overlay = scene.add.rectangle(
    fieldX + fieldWidth / 2,
    fieldY + fieldHeight / 2,
    fieldWidth,
    fieldHeight,
    0x000030,
    0.1
  );
  container.add(overlay);
  
  // Create rain drop texture first
  const rainParticle = scene.make.graphics({ x: 0, y: 0 }); // Fixed: Removed invalid 'add' property
  rainParticle.fillStyle(0xadd8e6, 1); // Light blue
  rainParticle.fillRect(0, 0, 2, 10);
  rainParticle.rotation = Math.PI / 6; // Angled rain
  
  // Generate texture from the graphics object
  rainParticle.generateTexture('rain_drop', 2, 10);
  
  // Add rain particles
  const particles = scene.add.particles(0, 0, 'rain_drop', {
    x: { min: fieldX - 100, max: fieldX + fieldWidth + 100 },
    y: fieldY - 50,
    speedY: { min: 300, max: 500 },
    scale: { start: 0.1, end: 0.1 },
    quantity: 3,
    blendMode: Phaser.BlendModes.ADD,
    lifespan: 2000,
    gravityY: 300
  });
  
  container.add(particles);
  
  // Puddle effects
  for (let i = 0; i < 10; i++) {
    const puddleX = fieldX + Math.random() * fieldWidth;
    const puddleY = fieldY + Math.random() * fieldHeight;
    const puddleSize = 10 + Math.random() * 20;
    
    const puddle = scene.add.ellipse(
      puddleX,
      puddleY,
      puddleSize,
      puddleSize / 2,
      0x2a6fdb,
      0.1
    );
    
    container.add(puddle);
    
    // Animate puddle
    scene.tweens.add({
      targets: puddle,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 0.15,
      duration: 1000 + Math.random() * 2000,
      repeat: -1,
      yoyo: true
    });
  }
};

// Add cloudy weather effects
const addCloudyEffects = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  fieldWidth: number,
  fieldHeight: number,
  fieldX: number,
  fieldY: number
): void => {
  // Darken field slightly
  const overlay = scene.add.rectangle(
    fieldX + fieldWidth / 2,
    fieldY + fieldHeight / 2,
    fieldWidth,
    fieldHeight,
    0x000030,
    0.05
  );
  container.add(overlay);
  
  // Add cloud shadows
  for (let i = 0; i < 5; i++) {
    const shadowX = fieldX + Math.random() * fieldWidth;
    const shadowY = fieldY + Math.random() * fieldHeight;
    const shadowSize = 50 + Math.random() * 100;
    
    const cloudShadow = scene.add.ellipse(
      shadowX,
      shadowY,
      shadowSize,
      shadowSize * 0.6,
      0x000000,
      0.05
    );
    
    container.add(cloudShadow);
    
    // Animate cloud shadows slowly moving
    scene.tweens.add({
      targets: cloudShadow,
      x: shadowX + 50 - Math.random() * 100,
      y: shadowY + 10 - Math.random() * 20,
      duration: 10000 + Math.random() * 10000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }
};

// Add sunny weather effects
const addSunnyEffects = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  fieldWidth: number,
  fieldHeight: number,
  fieldX: number,
  fieldY: number
): void => {
  // Add bright spots to simulate sunlight
  for (let i = 0; i < 8; i++) {
    const spotX = fieldX + Math.random() * fieldWidth;
    const spotY = fieldY + Math.random() * fieldHeight;
    const spotSize = 30 + Math.random() * 50;
    
    // Create a radial gradient for the sunspot
    const sunSpot = scene.add.circle(
      spotX,
      spotY,
      spotSize,
      0xffff88,
      0.1
    );
    
    container.add(sunSpot);
    
    // Animate sun spots pulsing
    scene.tweens.add({
      targets: sunSpot,
      alpha: 0.05,
      scale: 1.2,
      duration: 2000 + Math.random() * 2000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }
};

// Add partly cloudy weather effects (mix of sunny and cloudy)
const addPartlyCloudyEffects = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  fieldWidth: number,
  fieldHeight: number,
  fieldX: number,
  fieldY: number
): void => {
  // Add some cloud shadows (fewer than full cloudy)
  for (let i = 0; i < 3; i++) {
    const shadowX = fieldX + Math.random() * fieldWidth;
    const shadowY = fieldY + Math.random() * fieldHeight;
    const shadowSize = 30 + Math.random() * 80;
    
    const cloudShadow = scene.add.ellipse(
      shadowX,
      shadowY,
      shadowSize,
      shadowSize * 0.6,
      0x000000,
      0.03
    );
    
    container.add(cloudShadow);
    
    // Animate cloud shadows slowly moving
    scene.tweens.add({
      targets: cloudShadow,
      x: shadowX + 30 - Math.random() * 60,
      y: shadowY + 10 - Math.random() * 20,
      duration: 8000 + Math.random() * 8000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }
  
  // Add a few sun spots (fewer than full sunny)
  for (let i = 0; i < 4; i++) {
    const spotX = fieldX + Math.random() * fieldWidth;
    const spotY = fieldY + Math.random() * fieldHeight;
    const spotSize = 20 + Math.random() * 40;
    
    const sunSpot = scene.add.circle(
      spotX,
      spotY,
      spotSize,
      0xffff88,
      0.08
    );
    
    container.add(sunSpot);
    
    // Animate sun spots pulsing
    scene.tweens.add({
      targets: sunSpot,
      alpha: 0.04,
      scale: 1.1,
      duration: 3000 + Math.random() * 2000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }
};
