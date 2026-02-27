
import React from 'react';
import { PlayerData } from '@/hooks/useTeamPlayers';

interface PlayerNameTagProps {
  player?: PlayerData;
}

const PlayerNameTag: React.FC<PlayerNameTagProps> = ({ player }) => {
  // Get initials from player name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}. ${lastName}`;
  };

  return (
    <div className="text-xs font-bold text-white bg-green-900/70 px-1 rounded">
      {player ? getInitials(player.first_name, player.last_name) : "—"}
    </div>
  );
};

export default PlayerNameTag;
