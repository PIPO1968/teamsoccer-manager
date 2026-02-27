
import Phaser from 'phaser';
import { Player } from '../../../../../components/types/match';
import { hexToRgb } from '../utils/colorConverter';

// Create a player sprite/container with all necessary visual elements
export const createPlayer = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  player: Player,
  isHomeTeam: boolean,
  teamColor: string
): Phaser.GameObjects.Container => {
  // Convert hex color to RGB
  const rgb = hexToRgb(teamColor);
  
  // Create the main player circle
  const playerSize = 10;
  const playerCircle = scene.add.circle(0, 0, playerSize, rgb.color, 1);
  playerCircle.setStrokeStyle(2, 0xffffff);
  
  // Create player label (position)
  const textStyle = {
    font: '9px Arial',
    color: '#ffffff'
  };
  
  const positionText = scene.add.text(0, 0, getPositionShort(player.position), textStyle);
  positionText.setOrigin(0.5);
  
  // Create energy indicator (small bar below player)
  const energyWidth = playerSize * 1.6;
  const energyHeight = 3;
  
  // Background bar (gray)
  const energyBg = scene.add.rectangle(
    0,
    playerSize + 5,
    energyWidth,
    energyHeight,
    0x333333
  );
  energyBg.setOrigin(0.5, 0.5);
  
  // Foreground bar (colored based on energy)
  const energyColor = getEnergyColor(player.energy);
  const energyFg = scene.add.rectangle(
    0 - energyWidth/2,
    playerSize + 5,
    energyWidth * (player.energy / 100),
    energyHeight,
    energyColor
  );
  energyFg.setOrigin(0, 0.5);
  
  // Create container for all player elements
  const container = scene.add.container(x, y, [
    playerCircle,
    positionText,
    energyBg,
    energyFg
  ]);
  
  // Add special indicators if needed
  if (player.isCaptain) {
    // Captain armband (small yellow dot above player)
    const captainIndicator = scene.add.circle(
      0,
      -playerSize - 5,
      4,
      0xffde00
    );
    container.add(captainIndicator);
  }
  
  if (player.isInjured) {
    // Injury indicator (red cross)
    const injuryLine1 = scene.add.line(
      0, 0,
      -5, -5,
      5, 5,
      0xff0000
    );
    injuryLine1.setLineWidth(2);
    
    const injuryLine2 = scene.add.line(
      0, 0,
      5, -5,
      -5, 5,
      0xff0000
    );
    injuryLine2.setLineWidth(2);
    
    const injuryIndicator = scene.add.container(0, 0, [injuryLine1, injuryLine2]);
    container.add(injuryIndicator);
  }
  
  // Store original player data
  container.setData('player', player);
  container.setData('isHomeTeam', isHomeTeam);
  
  return container;
};

// Helper function to get position abbreviation
const getPositionShort = (position: string): string => {
  switch (position.toUpperCase()) {
    case 'GOALKEEPER':
      return 'GK';
    case 'DEFENDER':
      return 'DEF';
    case 'MIDFIELDER':
      return 'MID';
    case 'FORWARD':
      return 'FWD';
    default:
      return position.substring(0, 3);
  }
};

// Get color based on energy level
const getEnergyColor = (energy: number): number => {
  if (energy > 80) return 0x22c55e; // Green
  if (energy > 60) return 0x84cc16; // Light green
  if (energy > 40) return 0xfacc15; // Yellow
  if (energy > 20) return 0xf97316; // Orange
  return 0xef4444; // Red
};
