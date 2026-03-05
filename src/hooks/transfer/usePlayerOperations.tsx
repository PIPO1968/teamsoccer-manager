
// Player/listing operations are now handled server-side in the /transfer-listings/:id/buy endpoint.
// This file is kept for compatibility but no longer makes direct DB calls.

export const usePlayerOperations = () => {
  const updatePlayerTeam = async (_playerId: number, _newTeamId: number) => {
    // No-op: player team update is done atomically in the buy endpoint
  };

  const deactivatePlayerListings = async (_playerId: number) => {
    // No-op: listings are deactivated atomically in the buy endpoint
    return 0;
  };

  return {
    updatePlayerTeam,
    deactivatePlayerListings
  };
};
