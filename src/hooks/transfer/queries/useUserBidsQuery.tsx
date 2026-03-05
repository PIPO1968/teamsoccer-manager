
import { apiFetch } from "@/services/apiClient";
import { useUserTeam } from "../../useUserTeam";
import { PlayerBid } from "@/pages/transfer-market/types";

export const useUserBidsQuery = () => {
  const { team } = useUserTeam();

  const getUserBids = async (): Promise<PlayerBid[]> => {
    if (!team?.team_id) {
      return [];
    }

    try {
      const data = await apiFetch<{ success: boolean; bids: any[] }>(
        `/transfer-bids?teamId=${team.team_id}`
      );
      return (data.bids || []).map(bid => ({
        id: Number(bid.id) || 0,
        transfer_listing_id: bid.transfer_listing_id || 0,
        bidder_team_id: bid.bidder_team_id || 0,
        bidder_name: bid.bidder_name || "Unknown",
        bid_amount: bid.bid_amount || 0,
        status: (bid.status || 'pending') as 'pending' | 'accepted' | 'rejected' | 'outbid',
        created_at: bid.created_at || new Date().toISOString(),
        player_id: bid.player_id || 0,
        player_name: bid.player_name || "Unknown Player",
        deadline: bid.deadline || null,
        is_active: bid.is_active || false,
        seller_team_id: bid.seller_team_id || 0,
        seller_team_name: bid.seller_team_name || "Unknown Team"
      }));
    } catch (error) {
      console.error('Error in getUserBids:', error);
      return [];
    }
  };

  return {
    getUserBids
  };
};
