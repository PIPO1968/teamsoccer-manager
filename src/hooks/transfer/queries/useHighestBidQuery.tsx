
import { supabase } from "@/integrations/supabase/client";
import { useUserTeam } from "../../useUserTeam";
import { BidHighestResult } from "../bidTypes";

export const useHighestBidQuery = () => {
  const { team } = useUserTeam();

  const getHighestBid = async (listingId: number | undefined): Promise<BidHighestResult> => {
    // Return default values if listing ID is undefined or null
    if (!listingId) {
      console.log("No listing ID provided for highest bid");
      return { amount: 0, isUserBid: false };
    }

    try {
      console.log(`Fetching highest bid for listing ${listingId}`);
      
      const { data, error } = await supabase
        .from('transfer_bids')
        .select('id, bid_amount, bidder_team_id')
        .eq('transfer_listing_id', listingId)
        .eq('status', 'pending')
        .order('bid_amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching highest bid for listing ${listingId}:`, error);
        return { amount: 0, isUserBid: false };
      }

      if (!data) {
        console.log(`No bids found for listing ${listingId}`);
        return { amount: 0, isUserBid: false };
      }

      const isUserBid = team?.team_id !== undefined && 
                       data?.bidder_team_id !== undefined && 
                       data.bidder_team_id === team.team_id;

      console.log(`Highest bid for listing ${listingId}: ${data.bid_amount}, isUserBid: ${isUserBid}`);

      return {
        amount: data?.bid_amount || 0,
        isUserBid: isUserBid
      };
    } catch (error) {
      console.error(`Error processing highest bid for listing ${listingId}:`, error);
      return { amount: 0, isUserBid: false };
    }
  };

  return {
    getHighestBid
  };
};
