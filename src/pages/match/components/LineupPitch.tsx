import React, { useState } from 'react';
import PlayerOnPitch from './PlayerOnPitch';
import { PlayerData } from '@/hooks/useTeamPlayers';
import PlayerDetailsDialog from './PlayerDetailsDialog';

interface LineupPitchProps {
  formation: string;
  players: PlayerData[];
  selectedPlayers: { [key: string]: PlayerData };
  onPlayerSwap: (position: string, player: PlayerData) => void;
  selectedPlayer: PlayerData | null;
}

const LineupPitch: React.FC<LineupPitchProps> = ({ 
  formation, 
  players, 
  selectedPlayers,
  onPlayerSwap,
  selectedPlayer
}) => {
  const [detailPlayer, setDetailPlayer] = useState<PlayerData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to handle player details view
  const handlePlayerDetails = (player: PlayerData) => {
    setDetailPlayer(player);
    setIsDialogOpen(true);
  };

  // Function to handle position click
  const handlePositionClick = (positionId: string) => {
    if (selectedPlayer) {
      onPlayerSwap(positionId, selectedPlayer);
    }
  };

  // Get player positions based on formation - now with top-down orientation
  const getPositions = () => {
    const formationString = formation.split('-');
    const defenders = parseInt(formationString[0]);
    const midfielders = parseInt(formationString[1]);
    const forwards = parseInt(formationString[2] || '0');
    
    // Basic positions - goalkeeper at the top
    const positions = [
      // Goalkeeper - now at the top of the field
      { id: 'GK', displayPosition: 'GK', x: '50%', y: '15%' },

      // Defenders positions - spread across the field, now below the goalkeeper
      ...Array(defenders).fill(0).map((_, i) => {
        const spreadPos = (i + 1) / (defenders + 1);
        const xPos = 10 + (80 * spreadPos);
        return { 
          id: `DEF${i + 1}`, 
          displayPosition: i === Math.floor(defenders / 2) ? 'CB' : i < defenders / 2 ? 'LB' : 'RB', 
          x: `${xPos}%`, 
          y: '35%' 
        };
      }),

      // Midfielders positions
      ...Array(midfielders).fill(0).map((_, i) => {
        const spreadPos = (i + 1) / (midfielders + 1);
        const xPos = 10 + (80 * spreadPos);
        return { 
          id: `MID${i + 1}`, 
          displayPosition: i === Math.floor(midfielders / 2) ? 'CM' : i < midfielders / 2 ? 'LM' : 'RM', 
          x: `${xPos}%`, 
          y: '60%' 
        };
      }),

      // Forwards positions - now at the bottom
      ...Array(forwards).fill(0).map((_, i) => {
        const spreadPos = (i + 1) / (forwards + 1);
        const xPos = 10 + (80 * spreadPos);
        return { 
          id: `FWD${i + 1}`, 
          displayPosition: forwards === 1 ? 'ST' : i < forwards / 2 ? 'LW' : 'RW', 
          x: `${xPos}%`, 
          y: '85%' 
        };
      })
    ];

    return positions;
  };

  const positions = getPositions();

  return (
    <div className="relative w-full h-[500px] border-4 border-white rounded-md bg-green-800 bg-opacity-80 mt-4 overflow-hidden">
      {/* Field markings - showing only half-field with proper orientation */}
      <div className="absolute inset-0">
        {/* Goal at the top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-4 border-b-4 border-l-4 border-r-4 border-white"></div>
        
        {/* Penalty area at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-20 border-b-2 border-l-2 border-r-2 border-white opacity-70"></div>
        
        {/* Goal area at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 border-b-2 border-l-2 border-r-2 border-white opacity-70"></div>
        
        {/* Penalty spot */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
        
        {/* Center circle - now just half circle at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 border-t-2 border-white opacity-70 rounded-t-full"></div>
        
        {/* Penalty arc */}
        <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-32 h-8 border-b-2 border-white opacity-70 rounded-b-full"></div>
        
        {/* Middle line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white opacity-70"></div>
        
        {/* Corner arcs */}
        <div className="absolute top-0 left-0 w-6 h-6 border-b-2 border-r-2 rounded-br-full border-white opacity-70"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-full border-white opacity-70"></div>
      </div>

      {/* Players */}
      {positions.map((pos) => (
        <PlayerOnPitch
          key={pos.id}
          id={pos.id}
          x={pos.x}
          y={pos.y}
          displayPosition={pos.displayPosition}
          player={selectedPlayers[pos.id]}
          onSelect={() => handlePositionClick(pos.id)}
          onPlayerClick={handlePlayerDetails}
          selectedPlayer={selectedPlayer}
        />
      ))}

      {/* Player Details Dialog */}
      <PlayerDetailsDialog 
        player={detailPlayer}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};

export default LineupPitch;
