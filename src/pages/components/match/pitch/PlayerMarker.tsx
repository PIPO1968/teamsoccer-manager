
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Player } from '../../types/match';

interface PlayerMarkerProps {
  player: Player;
  isHomeTeam: boolean;
  getFormColor: (form: string) => string;
  onPlayerClick: (playerId: number) => void;
}

const PlayerMarker: React.FC<PlayerMarkerProps> = ({ 
  player, 
  isHomeTeam, 
  getFormColor,
  onPlayerClick
}) => {
  return (
    <div
      className={cn(
        "absolute flex flex-col items-center transition-all duration-500 cursor-pointer",
        player.isInjured ? "opacity-90 grayscale" : ""
      )}
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        zIndex: 3,
        transition: "left 0.5s ease-out, top 0.5s ease-out"
      }}
      onClick={() => onPlayerClick(player.id)}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center relative shadow-lg",
          player.isInjured ? "bg-red-400" : isHomeTeam ? "bg-primary" : "bg-team-primary"
        )}
      >
        <span className="text-white text-xs select-none">{player.position}</span>
        {player.isCaptain && (
          <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center">C</Badge>
        )}
      </div>
      <div className="text-xs font-medium text-white bg-black/50 px-1 rounded mt-1 shadow whitespace-nowrap">
        {player.lastName || player.name || '???'}
      </div>
      <div className="mt-1">
        <div
          className={cn("h-[3px] rounded-full", getFormColor(player.form))}
          style={{ width: `${player.energy / 10}px` }}
        ></div>
      </div>
    </div>
  );
};

export default PlayerMarker;
