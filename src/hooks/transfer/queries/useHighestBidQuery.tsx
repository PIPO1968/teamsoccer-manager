
import { apiFetch } from "@/services/apiClient";
import { useUserTeam } from "../../useUserTeam";
import { BidHighestResult } from "../bidTypes";

export const useHighestBidQuery = () => {
  const { team } = useUserTeam();

  const getHighestBid = async (listingId: number | undefined): Promise<BidHighestResult> => {
    if (!listingId) {
      return { amount: 0, isUserBid: false };
    }

    try {
      const data = await apiFetch<{ success: boolean; bid: any }>(
        `/transfer-listings/${listingId}/highest-bid`
      );

      if (!data.bid) {
        return { amount: 0, isUserBid: false };
      }

      const isUserBid = team?.team_id !== undefined &&
        data.bid.bidder_team_id !== undefined &&
        data.bid.bidder_team_id === team.team_id;

      return {
        amount: data.bid.bid_amount || 0,
        isUserBid
      };
    } catch (error) {
      console.error(`Error fetching highest bid for listing ${listingId}:`, error);
      return { amount: 0, isUserBid: false };
    }
  };

  return {
    getHighestBid
  };
};
