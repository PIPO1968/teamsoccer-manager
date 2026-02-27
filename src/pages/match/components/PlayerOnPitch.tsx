
import React from 'react';
import { PlayerData } from '@/hooks/useTeamPlayers';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import PlayerAvatar from './player/PlayerAvatar';
import PlayerDetails from './player/PlayerDetails';
import PlayerRatingIndicator from './player/PlayerRatingIndicator';
import PlayerNameTag from './player/PlayerNameTag';

interface PlayerOnPitchProps {
  id: string;
  x: string;
  y: string;
  player?: PlayerData;
  displayPosition: string;
  onSelect: () => void;
  onPlayerClick: (player: PlayerData) => void;
  selectedPlayer: PlayerData | null;
}

const PlayerOnPitch: React.FC<PlayerOnPitchProps> = ({ 
  id,
  x, 
  y, 
  player,
  displayPosition,
  onSelect,
  onPlayerClick,
  selectedPlayer
}) => {
  const handlePositionClick = () => {
    onSelect();
  };

  const handlePlayerDetailsClick = (e: React.MouseEvent) => {
    if (player) {
      e.stopPropagation();
      onPlayerClick(player);
    }
  };

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      style={{ left: x, top: y }}
    >
      {player ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div>
              <PlayerAvatar 
                player={player}
                displayPosition={displayPosition}
                isSelected={selectedPlayer?.player_id === player.player_id}
                onClick={handlePositionClick}
                onDoubleClick={handlePlayerDetailsClick}
              />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 z-[100]">
            <PlayerDetails player={player} />
          </HoverCardContent>
        </HoverCard>
      ) : (
        <PlayerAvatar 
          displayPosition={displayPosition}
          isSelected={selectedPlayer !== null}
          onClick={handlePositionClick}
        />
      )}
      
      <div className="mt-1 text-center">
        <PlayerNameTag player={player} />
        
        {player && <PlayerRatingIndicator player={player} />}
      </div>
    </div>
  );
};

export default PlayerOnPitch;
