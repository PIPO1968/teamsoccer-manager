
// Finance update logic is now handled server-side in the /transfer-listings/:id/buy endpoint.
// This file is kept for compatibility but no longer makes direct DB calls.

export const useFinanceOperations = () => {
  const updateTeamFinancesForPurchase = async (_teamId: number, _askingPrice: number) => {
    // No-op: finances are updated atomically in the buy endpoint
  };

  const updateTeamFinancesForSale = async (_teamId: number, _askingPrice: number) => {
    // No-op: finances are updated atomically in the buy endpoint
  };

  return {
    updateTeamFinancesForPurchase,
    updateTeamFinancesForSale
  };
};
