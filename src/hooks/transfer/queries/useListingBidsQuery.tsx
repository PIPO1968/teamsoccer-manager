
import { apiFetch } from "@/services/apiClient";
import { PlayerBid } from "@/pages/transfer-market/types";

export const useListingBidsQuery = () => {
  const getListingBids = async (listingId: number | undefined): Promise<PlayerBid[]> => {
    if (!listingId) {
      return [];
    }

    try {
      const data = await apiFetch<{ success: boolean; bids: any[] }>(
        `/transfer-listings/${listingId}/bids`
      );
      return (data.bids || []).map(bid => ({
        id: Number(bid.id) || 0,
        transfer_listing_id: bid.transfer_listing_id || 0,
        bidder_team_id: bid.bidder_team_id || 0,
        bidder_name: bid.bidder_name || "Unknown Team",
        bid_amount: bid.bid_amount || 0,
        status: (bid.status || 'pending') as 'pending' | 'accepted' | 'rejected' | 'outbid',
        created_at: bid.created_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error(`Error in getListingBids for listing ${listingId}:`, error);
      return [];
    }
  };

  return {
    getListingBids
  };
};
