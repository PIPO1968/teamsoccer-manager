
import React from 'react';
import { cn } from '@/lib/utils';
import { getPositionColor } from '../../utils/formationUtils';
import { PlayerData } from '@/hooks/useTeamPlayers';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlayerAvatar as DiceBearPlayerAvatar } from "@/components/avatar/PlayerAvatar";

interface PlayerAvatarProps {
  player?: PlayerData;
  displayPosition: string;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ 
  player, 
  displayPosition, 
  isSelected, 
  onClick, 
  onDoubleClick 
}) => {
  return (
    <div 
      className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all",
        "hover:scale-110 hover:shadow-md border-2",
        player ? getPositionColor(player.position) : "bg-gray-200 text-gray-500 border-gray-400",
        isSelected ? "ring-4 ring-yellow-300 ring-opacity-50" : "",
        !player && isSelected ? "animate-pulse" : ""
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {player ? (
        <DiceBearPlayerAvatar 
          player={player} 
          size="sm" 
          className="w-10 h-10"
        />
      ) : (
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-xs font-bold text-white">
            {displayPosition}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default PlayerAvatar;
