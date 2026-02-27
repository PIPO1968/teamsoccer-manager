
import { useListingOperations } from "./transfer/useListingOperations";
import { useBidOperations } from "./transfer/useBidOperations";
import { useBuyPlayer } from "./transfer/useBuyPlayer";

export const useTransferOperations = () => {
  const { listPlayerForSale, isProcessing: isListingProcessing } = useListingOperations();
  const { 
    placeBid, 
    getUserBids, 
    getListingBids, 
    getHighestBid, 
    isProcessing: isBiddingProcessing 
  } = useBidOperations();
  const { buyPlayer, isProcessing: isBuyingProcessing } = useBuyPlayer();

  return {
    listPlayerForSale,
    placeBid,
    getUserBids,
    getListingBids,
    getHighestBid,
    buyPlayer,
    isProcessing: isListingProcessing || isBiddingProcessing || isBuyingProcessing
  };
};
