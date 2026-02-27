
import React from 'react';
import CommentaryPlayer from './CommentaryPlayer';

interface EventDescriptionProps {
  description: string;
  onPlayerClick?: (playerId: number) => void;
}

const EventDescription: React.FC<EventDescriptionProps> = ({ description, onPlayerClick }) => {
  // Split description by player names (enclosed in brackets like [Player Name])
  const parts = description.split(/(\[.*?\])/);
  
  return (
    <span className="text-sm">
      {parts.map((part, index) => {
        // Check if this part is a player name (enclosed in brackets)
        if (part.startsWith('[') && part.endsWith(']')) {
          const playerName = part.slice(1, -1); // Remove brackets
          // Since we don't have actual player IDs from the description text,
          // we'll use a generated ID based on the player name for now
          const generatedPlayerId = playerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          
          return (
            <CommentaryPlayer 
              key={index}
              playerId={generatedPlayerId}
              playerName={playerName} 
              onPlayerClick={onPlayerClick}
            />
          );
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default EventDescription;
