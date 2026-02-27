
import React from 'react';
import { PlayerData } from '@/hooks/useTeamPlayers';

interface PlayerRatingIndicatorProps {
  player: PlayerData;
}

const PlayerRatingIndicator: React.FC<PlayerRatingIndicatorProps> = ({ player }) => {
  return (
    <div className="flex justify-center mt-1">
      {Array.from({length: Math.min(5, Math.ceil(player.rating / 20))}).map((_, i) => (
        <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full mx-0.5"></div>
      ))}
    </div>
  );
};

export default PlayerRatingIndicator;
