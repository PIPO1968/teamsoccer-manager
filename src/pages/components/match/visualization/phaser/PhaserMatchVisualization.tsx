
import React, { useEffect, useRef, useState } from 'react';
import { useMatchContext } from '../../MatchContext';
import { Card } from '@/components/ui/card';
import { Player } from '../../../../components/types/match';
import { createGame } from './game';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Grid3X3 } from 'lucide-react';

interface PhaserMatchVisualizationProps {
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeamColor?: string;
  awayTeamColor?: string;
  onPlayerClick?: (playerId: number) => void;
}

const PhaserMatchVisualization: React.FC<PhaserMatchVisualizationProps> = ({
  homePlayers,
  awayPlayers,
  homeTeamColor = '#3b82f6', // Blue for home team
  awayTeamColor = '#ef4444', // Red for away team
  onPlayerClick
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [showDebugGrid, setShowDebugGrid] = useState<boolean>(true);
  const [showPlayerPaths, setShowPlayerPaths] = useState<boolean>(true);
  
  const { weather } = useMatchContext();
  
  // Initialize Phaser game
  useEffect(() => {
    if (!gameContainerRef.current) return;
    
    // Destroy existing game instance if it exists
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }
    
    const { game } = createGame({
      parent: gameContainerRef.current,
      homePlayers,
      awayPlayers,
      homeTeamColor,
      awayTeamColor,
      onPlayerClick: (playerId) => {
        if (onPlayerClick) onPlayerClick(playerId);
      },
      weather: weather || 'sunny',
      showDebugGrid,
      showPlayerPaths
    });
    
    gameInstanceRef.current = game;
    
    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [homePlayers, awayPlayers, homeTeamColor, awayTeamColor, onPlayerClick]);
  
  // Toggle debug visualization
  const toggleDebugGrid = () => {
    setShowDebugGrid(!showDebugGrid);
    
    // Update the scene's debug grid visibility
    if (gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('SoccerPrototype') as any;
      if (scene) {
        scene.showDebugGrid = !showDebugGrid;
      }
    }
  };
  
  // Toggle path visualization
  const togglePlayerPaths = () => {
    setShowPlayerPaths(!showPlayerPaths);
    
    // Update the scene's path visibility
    if (gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('SoccerPrototype') as any;
      if (scene) {
        scene.showPlayerPaths = !showPlayerPaths;
      }
    }
  };
  
  return (
    <Card className="w-full overflow-hidden">
      <div className="w-full aspect-[16/9] p-3 relative">
        <div className="absolute right-4 top-4 z-10 space-x-2 flex">          
          <Button 
            size="sm" 
            variant={showDebugGrid ? "default" : "outline"} 
            onClick={toggleDebugGrid}
            title="Toggle Grid Visualization"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            {showDebugGrid ? 'Hide Grid' : 'Show Grid'}
          </Button>
          
          <Button 
            size="sm" 
            variant={showPlayerPaths ? "default" : "outline"} 
            onClick={togglePlayerPaths}
            title="Toggle Path Visualization"
          >
            {showPlayerPaths ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showPlayerPaths ? 'Hide Paths' : 'Show Paths'}
          </Button>
        </div>
        
        <div ref={gameContainerRef} className="w-full h-full rounded-md shadow" />
      </div>
    </Card>
  );
};

export default PhaserMatchVisualization;
