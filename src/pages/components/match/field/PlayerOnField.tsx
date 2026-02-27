
import React from 'react';
import { Player } from '../../types/match';
import { PlayerAvatar } from '@/components/avatar/PlayerAvatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { convertToPlayerData, getPlayerSurname } from '../utils/PlayerConversionUtils';

interface PlayerOnFieldProps {
  player: Player;
  isHomeTeam: boolean;
  onPlayerClick?: (player: Player) => void;
}

const PlayerOnField: React.FC<PlayerOnFieldProps> = ({ player, isHomeTeam, onPlayerClick }) => {
  // Use the real PlayerData if available, otherwise convert from Player
  const playerData = player.playerData || convertToPlayerData(player);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all z-20"
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`
      }}
      onClick={() => onPlayerClick && onPlayerClick(player)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center">
            <div className="relative">
              <PlayerAvatar 
                player={playerData} 
                size="sm"
                className={`w-12 h-12 border-3 ${isHomeTeam ? 'border-blue-500' : 'border-red-500'} shadow-lg`}
              />
            </div>
            <div className={`mt-1 text-xs font-bold text-white px-2 py-0.5 rounded shadow-md border border-white ${
              isHomeTeam ? 'bg-blue-600' : 'bg-red-600'
            }`}>
              {getPlayerSurname(player.name)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{player.name}</p>
          <p className="text-sm">{player.position}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default PlayerOnField;
