
import { MatchEventData } from '../../types/matchTypes';
import { Player } from '../../../../components/types/match';
import { weatherTypes } from '../../engine/utils/weatherUtils';

// Draw the basic soccer field
export const drawField = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weather?: string
): void => {
  // Field background
  ctx.fillStyle = '#4ade80'; // Green field
  ctx.fillRect(0, 0, width, height);
  
  // Add field texture/pattern based on weather
  if (weather) {
    addWeatherEffects(ctx, width, height, weather);
  }
  
  // Draw field lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  
  // Outline
  ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
  
  // Center line
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.05);
  ctx.lineTo(width * 0.5, height * 0.95);
  ctx.stroke();
  
  // Center circle
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.5, width * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  
  // Left goal area
  ctx.strokeRect(width * 0.05, height * 0.35, width * 0.1, height * 0.3);
  
  // Left penalty area
  ctx.strokeRect(width * 0.05, height * 0.25, width * 0.15, height * 0.5);
  
  // Right goal area
  ctx.strokeRect(width * 0.85, height * 0.35, width * 0.1, height * 0.3);
  
  // Right penalty area
  ctx.strokeRect(width * 0.8, height * 0.25, width * 0.15, height * 0.5);
  
  // Left goal
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(width * 0.04, height * 0.425, width * 0.01, height * 0.15);
  
  // Right goal
  ctx.fillRect(width * 0.95, height * 0.425, width * 0.01, height * 0.15);
  
  // Center spot
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.5, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  
  // Penalty spots
  ctx.beginPath();
  ctx.arc(width * 0.15, height * 0.5, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.5, 3, 0, Math.PI * 2);
  ctx.fill();
};

// Add weather visual effects to the field
const addWeatherEffects = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weather: string
): void => {
  // Check if weather exists in the weatherTypes
  const weatherInfo = weatherTypes[weather as keyof typeof weatherTypes];
  
  if (!weatherInfo) return;
  
  switch (weather) {
    case 'rainy':
      // Darken field slightly and add rain droplets
      ctx.fillStyle = 'rgba(0, 0, 30, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Add rain droplets
      ctx.fillStyle = 'rgba(200, 220, 255, 0.7)';
      const dropCount = 100;
      for (let i = 0; i < dropCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = 2 + Math.random() * 5;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - length, y + length * 2);
        ctx.stroke();
      }
      break;
      
    case 'cloudy':
      // Add subtle cloud shadows on field
      ctx.fillStyle = 'rgba(0, 0, 30, 0.05)';
      
      // Create a few random cloud shadows
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const cloudSize = 50 + Math.random() * 100;
        
        ctx.beginPath();
        ctx.ellipse(x, y, cloudSize, cloudSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'sunny':
      // Add bright spots to simulate sunlight
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 30 + Math.random() * 50;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'partlyCloudy':
      // Mixture of sunny and cloudy effects (less pronounced)
      // Add subtle cloud shadows
      ctx.fillStyle = 'rgba(0, 0, 30, 0.03)';
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const cloudSize = 30 + Math.random() * 80;
        
        ctx.beginPath();
        ctx.ellipse(x, y, cloudSize, cloudSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add a few bright spots
      for (let i = 0; i < 4; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 20 + Math.random() * 40;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
  }
};

// Draw players on the field
export const drawPlayers = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  homePlayers: Player[],
  awayPlayers: Player[],
  positions: {[key: number]: {x: number, y: number}},
  homeColor: string,
  awayColor: string
): void => {
  const allPlayers = [...homePlayers, ...awayPlayers];
  const playerSize = width * 0.02;
  
  allPlayers.forEach(player => {
    const pos = positions[player.id];
    if (!pos) return;
    
    // Convert percentage positions to canvas coordinates
    const x = (pos.x / 100) * width;
    const y = (pos.y / 100) * height;
    
    // Determine if player is home or away for coloring
    const isHome = homePlayers.some(p => p.id === player.id);
    const color = isHome ? homeColor : awayColor;
    
    // Draw player circle
    ctx.beginPath();
    ctx.arc(x, y, playerSize, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    
    // Draw player number or jersey
    ctx.fillStyle = 'white';
    ctx.font = `${playerSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Display the player's position as identifier
    ctx.fillText(player.position, x, y);
    
    // If player is captain, add a small indicator
    if (player.isCaptain) {
      ctx.beginPath();
      ctx.arc(x, y - playerSize * 1.5, playerSize * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'yellow';
      ctx.fill();
    }
    
    // If player is injured, add a visual indicator
    if (player.isInjured) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, playerSize * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

// Draw the ball on the field
export const drawBall = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ballX: number,
  ballY: number
): void => {
  // Convert percentage positions to canvas coordinates
  const x = (ballX / 100) * width;
  const y = (ballY / 100) * height;
  const ballSize = width * 0.01;
  
  // Draw main ball circle
  ctx.beginPath();
  ctx.arc(x, y, ballSize, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  
  // Add soccer ball pattern (simplified)
  ctx.beginPath();
  ctx.arc(x, y, ballSize * 0.6, 0, Math.PI * 2);
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = 'black';
  ctx.stroke();
};

// Draw event animations
export const drawEvent = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  event: MatchEventData,
  progress: number,
  ballPosition: { x: number, y: number },
  playerPositions: {[key: number]: {x: number, y: number}}
): void => {
  // Convert percentage positions to canvas coordinates
  const ballX = (ballPosition.x / 100) * width;
  const ballY = (ballPosition.y / 100) * height;
  
  switch (event.type) {
    case 'goal':
      drawGoalAnimation(ctx, width, height, event, progress, ballX, ballY);
      break;
    case 'shot':
      drawShotAnimation(ctx, width, height, event, progress, ballX, ballY);
      break;
    case 'yellow_card':
    case 'red_card':
      drawCardAnimation(ctx, width, height, event, progress, playerPositions);
      break;
    case 'foul':
      drawFoulAnimation(ctx, width, height, event, progress, playerPositions);
      break;
    case 'corner':
      drawCornerAnimation(ctx, width, height, event, progress, ballX, ballY);
      break;
    // Add more event animations as needed
  }
};

// Specific event animations
const drawGoalAnimation = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  event: MatchEventData,
  progress: number,
  ballX: number,
  ballY: number
): void => {
  // Goal celebration effect
  const radius = progress * width * 0.3;
  const opacity = 1 - progress;
  
  // Goal flash effect
  ctx.beginPath();
  ctx.arc(ballX, ballY, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 215, 0, ${opacity * 0.7})`;
  ctx.fill();
  
  // Goal text
  if (progress > 0.2) {
    ctx.font = `bold ${width * 0.08}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textOpacity = progress < 0.8 ? (progress - 0.2) / 0.6 : (1 - progress) * 5;
    ctx.fillStyle = `rgba(255, 215, 0, ${textOpacity})`;
    ctx.fillText('GOAL!', width / 2, height / 2);
  }
};

const drawShotAnimation = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  event: MatchEventData,
  progress: number,
  ballX: number,
  ballY: number
): void => {
  // Shot trail effect
  const trailLength = 20;
  const trailOpacity = 0.7 - (progress * 0.7);
  
  ctx.beginPath();
  ctx.moveTo(ballX, ballY);
  
  // Calculate the direction of the shot based on the event
  let targetX = width * 0.5;
  let targetY = height * 0.5;
  
  if (event.team === 'home') {
    targetX = width * 0.9;
  } else {
    targetX = width * 0.1;
  }
  
  // Draw a motion trail
  const trailX = ballX - (ballX - targetX) * progress * 0.3;
  const trailY = ballY - (ballY - targetY) * progress * 0.3;
  
  const gradient = ctx.createLinearGradient(ballX, ballY, trailX, trailY);
  gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
  gradient.addColorStop(1, `rgba(255, 255, 255, ${trailOpacity})`);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width * 0.005;
  ctx.lineTo(trailX, trailY);
  ctx.stroke();
  
  // Speed lines around the ball
  const speedLineCount = 5;
  ctx.strokeStyle = `rgba(255, 255, 255, ${trailOpacity})`;
  ctx.lineWidth = 1;
  
  for (let i = 0; i < speedLineCount; i++) {
    const angle = (Math.PI * 2 / speedLineCount) * i;
    const lineLength = width * 0.01 * (1 + progress);
    
    ctx.beginPath();
    ctx.moveTo(
      ballX + Math.cos(angle) * lineLength * 0.3,
      ballY + Math.sin(angle) * lineLength * 0.3
    );
    ctx.lineTo(
      ballX + Math.cos(angle) * lineLength,
      ballY + Math.sin(angle) * lineLength
    );
    ctx.stroke();
  }
};

const drawCardAnimation = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  event: MatchEventData,
  progress: number,
  playerPositions: {[key: number]: {x: number, y: number}}
): void => {
  if (!event.playerId || !playerPositions[event.playerId]) return;
  
  const playerPos = playerPositions[event.playerId];
  const playerX = (playerPos.x / 100) * width;
  const playerY = (playerPos.y / 100) * height;
  
  // Card animation parameters
  const cardWidth = width * 0.03;
  const cardHeight = width * 0.04;
  const cardY = playerY - (width * 0.08 * progress);
  
  // Draw the card
  ctx.fillStyle = event.type === 'yellow_card' ? 'yellow' : 'red';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  
  // Card raise animation
  ctx.save();
  ctx.translate(playerX, cardY);
  ctx.rotate((1 - progress) * Math.PI * 0.1);
  ctx.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
  ctx.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
  ctx.restore();
  
  // Add warning icon or effect if desired
};

const drawFoulAnimation = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  event: MatchEventData,
  progress: number,
  playerPositions: {[key: number]: {x: number, y: number}}
): void => {
  if (!event.playerId || !playerPositions[event.playerId]) return;
  
  const playerPos = playerPositions[event.playerId];
  const playerX = (playerPos.x / 100) * width;
  const playerY = (playerPos.y / 100) * height;
  
  // Foul indicators - small stars/sparkles around the player
  const sparkCount = 5;
  const sparkSize = width * 0.01;
  const maxDistance = width * 0.04;
  
  ctx.fillStyle = `rgba(255, 50, 50, ${(1 - progress) * 0.8})`;
  
  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 / sparkCount) * i + (progress * Math.PI);
    const distance = maxDistance * progress;
    const sparkX = playerX + Math.cos(angle) * distance;
    const sparkY = playerY + Math.sin(angle) * distance;
    
    // Draw star/sparkle
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const starAngle = (Math.PI * 2 / 5) * j - Math.PI / 2;
      const x = sparkX + Math.cos(starAngle) * sparkSize * (j % 2 === 0 ? 1 : 0.5);
      const y = sparkY + Math.sin(starAngle) * sparkSize * (j % 2 === 0 ? 1 : 0.5);
      
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
};

const drawCornerAnimation = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  event: MatchEventData,
  progress: number,
  ballX: number,
  ballY: number
): void => {
  // Determine which corner
  const isLeft = event.team === 'home' ? false : true;
  const isTop = Math.random() > 0.5; // Randomize top/bottom for simplicity
  
  const cornerX = isLeft ? width * 0.05 : width * 0.95;
  const cornerY = isTop ? height * 0.05 : height * 0.95;
  
  // Draw corner flag animation
  const flagHeight = height * 0.08;
  const flagWidth = width * 0.03;
  const waveAmount = Math.sin(progress * Math.PI * 4) * width * 0.01;
  
  // Flag pole
  ctx.beginPath();
  ctx.moveTo(cornerX, cornerY);
  ctx.lineTo(cornerX, cornerY - flagHeight);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Flag
  ctx.beginPath();
  ctx.moveTo(cornerX, cornerY - flagHeight);
  ctx.lineTo(cornerX + flagWidth, cornerY - flagHeight + waveAmount);
  ctx.lineTo(cornerX + flagWidth, cornerY - flagHeight * 0.7 + waveAmount);
  ctx.lineTo(cornerX, cornerY - flagHeight * 0.7);
  ctx.closePath();
  
  ctx.fillStyle = event.team === 'home' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)';
  ctx.fill();
  
  // Draw trajectory arc for the ball
  if (progress < 0.7) {
    const cpX = cornerX + (width * 0.2) * (isLeft ? 1 : -1);
    const cpY = cornerY - height * 0.2;
    
    const t = progress / 0.7;
    const arcX = quadraticBezier(cornerX, cpX, width * 0.5, t);
    const arcY = quadraticBezier(cornerY, cpY, height * 0.4, t);
    
    // Draw dotted trajectory
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cornerX, cornerY);
    ctx.quadraticCurveTo(cpX, cpY, arcX, arcY);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * (1 - t)})`;
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

// Helper function for bezier curves
const quadraticBezier = (p0: number, p1: number, p2: number, t: number): number => {
  return Math.pow(1 - t, 2) * p0 + 2 * (1 - t) * t * p1 + Math.pow(t, 2) * p2;
};
