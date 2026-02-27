
import React from 'react';

interface CommentaryPlayerProps {
  playerId: number;
  playerName: string;
  onPlayerClick?: (playerId: number) => void;
}

const CommentaryPlayer: React.FC<CommentaryPlayerProps> = ({ playerId, playerName, onPlayerClick }) => {
  return (
    <button 
      onClick={() => onPlayerClick?.(playerId)}
      className="font-semibold text-primary hover:underline"
    >
      {playerName}
    </button>
  );
};

export default CommentaryPlayer;
