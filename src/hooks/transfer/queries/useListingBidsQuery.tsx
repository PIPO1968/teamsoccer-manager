
import { supabase } from "@/integrations/supabase/client";
import { PlayerBid } from "@/pages/transfer-market/types";
import { createBidError } from "../bidTypes";

export const useListingBidsQuery = () => {
  const getListingBids = async (listingId: number | undefined): Promise<PlayerBid[]> => {
    // Return empty array if listing ID is undefined or null
    if (!listingId) {
      console.log("No listing ID provided for bids");
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('transfer_bids')
        .select(`
          id,
          transfer_listing_id,
          bidder_team_id,
          bid_amount,
          status,
          created_at,
          teams:bidder_team_id (name)
        `)
        .eq('transfer_listing_id', listingId)
        .order('bid_amount', { ascending: false });

      if (error) {
        console.error(`Error fetching bids for listing ${listingId}:`, error);
        throw createBidError(
          error.message || "Failed to fetch listing bids", 
          "get_listing_bids", 
          { listingId }
        );
      }

      // Map data to expected format
      return (data || []).map(bid => ({
        id: Number(bid.id) || 0,
        transfer_listing_id: bid.transfer_listing_id || 0,
        bidder_team_id: bid.bidder_team_id || 0,
        bidder_name: bid.teams?.name || "Unknown Team",
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
