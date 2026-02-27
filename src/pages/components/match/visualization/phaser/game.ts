
import Phaser from 'phaser';
import { SoccerPrototype } from './prototype/core/SoccerPrototype';
import { Player } from '../../../../components/types/match';

interface CreateGameOptions {
  parent: HTMLElement;
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeamColor: string;
  awayTeamColor: string;
  onPlayerClick?: (playerId: number) => void;
  weather?: string;
  showDebugGrid?: boolean;
  showPlayerPaths?: boolean;
}

export const createGame = (options: CreateGameOptions) => {
  // Get dimensions from parent element
  const width = options.parent.clientWidth;
  const height = options.parent.clientHeight;
  
  // Configure the game
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: options.parent,
    width,
    height,
    backgroundColor: '#4a5568', // Stadium background
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: [SoccerPrototype],
    transparent: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    }
  };
  
  // Create the Phaser game instance
  const game = new Phaser.Game(config);
  
  // Pass initial data to the scene
  game.scene.start('SoccerPrototype', {
    homePlayers: options.homePlayers,
    awayPlayers: options.awayPlayers,
    homeTeamColor: options.homeTeamColor,
    awayTeamColor: options.awayTeamColor,
    weather: options.weather,
    onPlayerClick: options.onPlayerClick,
    showDebugGrid: options.showDebugGrid !== undefined ? options.showDebugGrid : true,
    showPlayerPaths: options.showPlayerPaths !== undefined ? options.showPlayerPaths : true
  });
  
  // Return the game instance
  return { game };
};
