
import { useBidPlacement } from "./useBidPlacement";
import { useBidQueries } from "./useBidQueries";

export const useBidOperations = () => {
  const { placeBid, isProcessing } = useBidPlacement();
  const { getUserBids, getListingBids, getHighestBid } = useBidQueries();

  return {
    // Placement operations
    placeBid,
    isProcessing,
    
    // Query operations
    getUserBids,
    getListingBids,
    getHighestBid
  };
};
