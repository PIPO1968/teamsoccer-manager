
import React, { useEffect } from 'react';
import PlayerDetailsDialog from './PlayerDetailsDialog';

interface PlayerDetailsDialogWrapperProps {
  selectedPlayerId: number | null;
  isPlayerDetailsOpen: boolean;
  setIsPlayerDetailsOpen: (open: boolean) => void;
  setSelectedPlayerId: (id: number | null) => void;
}

const PlayerDetailsDialogWrapper: React.FC<PlayerDetailsDialogWrapperProps> = ({
  selectedPlayerId,
  isPlayerDetailsOpen,
  setIsPlayerDetailsOpen,
  setSelectedPlayerId
}) => {
  useEffect(() => {
    if (!isPlayerDetailsOpen) {
      setTimeout(() => {
        setSelectedPlayerId(null);
      }, 300);
    }
  }, [isPlayerDetailsOpen, setSelectedPlayerId]);

  return (
    <PlayerDetailsDialog
      playerId={selectedPlayerId}
      isOpen={isPlayerDetailsOpen}
      onClose={() => setIsPlayerDetailsOpen(false)}
    />
  );
};

export default PlayerDetailsDialogWrapper;
